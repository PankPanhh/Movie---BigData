#!/usr/bin/env node
// scripts/migrateYearsCleanup.js
// Migrate movie.year field: clean string values like "2014è" -> 2014 (Number)
import mongoose from "mongoose";
import Movie from "../models/Movie.js";

const MONGO =
  process.env.MONGODB_URI || "mongodb://localhost:27017/movie-analytics";
const BATCH_SIZE = 500;

function extractYearFromString(str) {
  if (!str || typeof str !== "string") return null;
  // Find first 4-digit or 3-4 digit year-like sequence
  const m = str.match(/(18|19|20)\d{2}/);
  if (m) return parseInt(m[0], 10);
  // Fallback: any sequence of 3-4 digits
  const m2 = str.match(/(\d{3,4})/);
  if (m2) return parseInt(m2[0], 10);
  return null;
}

async function run() {
  console.log("🔌 Connecting to", MONGO);
  await mongoose.connect(MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    // Count problematic docs where year is a string or contains non-digit
    const problemCount = await Movie.countDocuments({
      $or: [{ year: { $type: "string" } }, { year: { $type: "symbol" } }],
    });
    console.log(
      `🧭 Found ${problemCount} documents with year stored as non-number (string/symbol)`
    );

    if (problemCount === 0) {
      console.log("✅ No string-year documents found. Exiting.");
      return;
    }

    const cursor = Movie.find({ year: { $type: "string" } }).cursor();
    let ops = [];
    let processed = 0;

    for await (const doc of cursor) {
      const raw = doc.year;
      const newYear = extractYearFromString(raw);
      let update = null;

      if (
        newYear &&
        newYear >= 1800 &&
        newYear <= new Date().getFullYear() + 1
      ) {
        update = { year: newYear };
      } else {
        // If can't parse to reasonable year, set to null so diagnostics can show it
        update = { year: null };
      }

      ops.push({
        updateOne: { filter: { _id: doc._id }, update: { $set: update } },
      });

      if (ops.length >= BATCH_SIZE) {
        const res = await Movie.bulkWrite(ops, { ordered: false });
        console.log(`  ↳ Applied batch of ${ops.length} updates`);
        processed += ops.length;
        ops = [];
      }
    }

    if (ops.length > 0) {
      await Movie.bulkWrite(ops, { ordered: false });
      processed += ops.length;
      console.log(`  ↳ Applied final batch of ${ops.length} updates`);
    }

    console.log(`🎉 Migration complete. Processed ${processed} documents.`);

    // Optional: re-run diagnostics endpoint or aggregation to confirm
    const withNumber = await Movie.countDocuments({
      year: { $type: "number" },
    });
    const withString = await Movie.countDocuments({
      year: { $type: "string" },
    });
    console.log(`📊 Now: withNumber=${withNumber}, withString=${withString}`);
  } catch (err) {
    console.error("❌ Migration error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔒 Disconnected");
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}

export default run;
