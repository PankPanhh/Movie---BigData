#!/usr/bin/env node
/*
  compareIndexDemo.js
  - Sao chép collection `movies` sang `movies_demo` (nếu chưa có)
  - Chạy explain + nhiều lần chạy thực tế cho truy vấn mẫu (before)
  - Tạo index (genres:1, year:-1)
  - Chạy lại explain + nhiều lần chạy thực tế (after)
  - In báo cáo tóm tắt

  Usage: node scripts/compareIndexDemo.js
  Config: set MONGO_URI in backend/.env
*/

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MONGO_URI is not set. Please add it to your .env file.");
  process.exit(1);
}

const SOURCE_COLL = "movies";
const DEMO_COLL = "movies_demo";
const SAMPLE_QUERY = { genres: "Action", year: { $gte: 2010 } }; // chỉnh nếu cần
const TIMING_RUNS = 5; // số lần chạy để đo median/mean

function msFromHrtime(hr) {
  return Number(hr / BigInt(1e6));
}

function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[m - 1] + s[m]) / 2 : s[m];
}

async function dropIndexIfExists(coll, indexSpec) {
  try {
    const indexes = await coll.indexes();
    const indexName = indexes.find(
      (idx) => JSON.stringify(idx.key) === JSON.stringify(indexSpec)
    )?.name;
    if (indexName) {
      await coll.dropIndex(indexName);
      console.log(`Dropped existing index: ${indexName}`);
      return true;
    }
  } catch (err) {
    console.warn("Error checking/dropping index:", err.message);
  }
  return false;
}

async function ensureDemoCollection(db) {
  const exists = await db.listCollections({ name: DEMO_COLL }).toArray();
  if (exists.length) {
    console.log(`Demo collection '${DEMO_COLL}' already exists.`);
    return;
  }

  console.log(
    `Creating demo collection '${DEMO_COLL}' by copying '${SOURCE_COLL}' (this may take time)...`
  );
  try {
    // Try using aggregation with $out (server-side copy)
    await db
      .collection(SOURCE_COLL)
      .aggregate([{ $match: {} }, { $out: DEMO_COLL }], { allowDiskUse: true })
      .toArray();
    console.log("Copy completed via $out.");
  } catch (err) {
    console.warn(
      "$out copy failed or is unsupported in this environment, falling back to cursor copy:",
      err.message || err
    );
    // Fallback: stream documents and insert in batches
    const cursor = db.collection(SOURCE_COLL).find({}, { projection: {} });
    const batch = [];
    const BATCH_SIZE = 1000;
    for await (const doc of cursor) {
      batch.push(doc);
      if (batch.length >= BATCH_SIZE) {
        await db.collection(DEMO_COLL).insertMany(batch);
        batch.length = 0;
      }
    }
    if (batch.length) await db.collection(DEMO_COLL).insertMany(batch);
    console.log("Fallback copy completed.");
  }
}

async function getExplainFind(coll, query) {
  try {
    return await coll.find(query).explain("executionStats");
  } catch (err) {
    return { error: String(err) };
  }
}

async function runTimedRuns(coll, query, runs = 5) {
  const times = [];
  for (let i = 0; i < runs; i++) {
    const t0 = process.hrtime.bigint();
    // project only _id to reduce network/bandwidth
    await coll.find(query).project({ _id: 1 }).toArray();
    const t1 = process.hrtime.bigint();
    times.push(msFromHrtime(t1 - t0));
  }
  return times;
}

async function summarizeExplain(explain) {
  if (!explain || explain.error) return explain;
  // executionStats path
  const stats = explain.executionStats || explain;
  const summary = {
    executionTimeMillis: stats.executionTimeMillis ?? null,
    totalDocsExamined: stats.totalDocsExamined ?? null,
    totalKeysExamined: stats.totalKeysExamined ?? null,
    nReturned: stats.nReturned ?? null,
    stage: stats.executionStages ? stats.executionStages.stage || null : null,
  };
  return summary;
}

async function main() {
  console.log("Compare Index Demo — connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  try {
    await ensureDemoCollection(db);

    const coll = db.collection(DEMO_COLL);

    // Drop index if exists for "before" demo
    const indexSpec = { genres: 1, year: -1 };
    await dropIndexIfExists(coll, indexSpec);

    console.log("\n--- BEFORE creating index ---");
    const explainBefore = await getExplainFind(coll, SAMPLE_QUERY);
    const summaryBefore = await summarizeExplain(explainBefore);
    console.log("Explain (before):", JSON.stringify(summaryBefore, null, 2));

    console.log(
      `Running query ${TIMING_RUNS} times (warm runs) to measure actual latency...`
    );
    const timesBefore = await runTimedRuns(coll, SAMPLE_QUERY, TIMING_RUNS);
    console.log("Runtimes (ms) before:", timesBefore);
    console.log("Median (ms) before:", median(timesBefore));

    console.log("\nCreating index { genres: 1, year: -1 } ...");
    const indexName = await coll.createIndex({ genres: 1, year: -1 });
    console.log("Index created:", indexName);

    console.log("\n--- AFTER creating index ---");
    const explainAfter = await getExplainFind(coll, SAMPLE_QUERY);
    const summaryAfter = await summarizeExplain(explainAfter);
    console.log("Explain (after):", JSON.stringify(summaryAfter, null, 2));

    console.log(
      `Running query ${TIMING_RUNS} times (warm runs) to measure actual latency...`
    );
    const timesAfter = await runTimedRuns(coll, SAMPLE_QUERY, TIMING_RUNS);
    console.log("Runtimes (ms) after:", timesAfter);
    console.log("Median (ms) after:", median(timesAfter));

    // Use db.command({ collStats }) for compatibility
    const collStats = await db.command({ collStats: DEMO_COLL });
    console.log(
      "\nCollection stats (indexes):",
      JSON.stringify(
        {
          count: collStats.count,
          totalIndexSize: collStats.totalIndexSize,
          indexSizes: collStats.indexSizes,
        },
        null,
        2
      )
    );

    console.log("\nSummary report:");
    console.table([
      {
        metric: "executionTimeMillis_before",
        value: summaryBefore.executionTimeMillis,
      },
      {
        metric: "totalDocsExamined_before",
        value: summaryBefore.totalDocsExamined,
      },
      { metric: "medianRuntimeMs_before", value: median(timesBefore) },
      {
        metric: "executionTimeMillis_after",
        value: summaryAfter.executionTimeMillis,
      },
      {
        metric: "totalDocsExamined_after",
        value: summaryAfter.totalDocsExamined,
      },
      { metric: "medianRuntimeMs_after", value: median(timesAfter) },
      { metric: "index_totalIndexSize", value: collStats.totalIndexSize },
    ]);

    // Optional: drop index after demo (controlled by env var DROP_INDEX_AFTER)
    if (process.env.DROP_INDEX_AFTER === "true") {
      console.log("Dropping demo index...");
      await coll.dropIndex(indexName);
      console.log("Index dropped.");
    }

    console.log("Demo finished.");
  } catch (err) {
    console.error("Error during demo:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
