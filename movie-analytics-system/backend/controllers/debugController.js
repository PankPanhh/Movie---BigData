import mongoose from "mongoose";

const SOURCE_COLL = "movies";
const DEMO_COLL = "movies_demo";

function msFromHrtime(hr) {
  return Number(hr / BigInt(1e6));
}

function median(arr) {
  if (!arr || !arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[m - 1] + s[m]) / 2 : s[m];
}

async function ensureDemoCollection(db) {
  const exists = await db.listCollections({ name: DEMO_COLL }).toArray();
  if (exists.length) return { created: false };

  // try $out copy first
  try {
    await db
      .collection(SOURCE_COLL)
      .aggregate([{ $match: {} }, { $out: DEMO_COLL }], { allowDiskUse: true })
      .toArray();
    return { created: true, method: "$out" };
  } catch (err) {
    // fallback to cursor copy
    const cursor = db.collection(SOURCE_COLL).find({}, { projection: {} });
    const BATCH_SIZE = 1000;
    let batch = [];
    for await (const doc of cursor) {
      batch.push(doc);
      if (batch.length >= BATCH_SIZE) {
        await db.collection(DEMO_COLL).insertMany(batch);
        batch = [];
      }
    }
    if (batch.length) await db.collection(DEMO_COLL).insertMany(batch);
    return { created: true, method: "cursor-copy" };
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

export async function compareIndex(req, res) {
  const db = mongoose.connection.db;
  if (!db) {
    const msg = "MongoDB connection not ready";
    console.error(msg);
    return res.status(500).json({ error: msg });
  }
  const copy = req.query.copy === "true";
  const drop = req.query.drop === "true";
  const runs = parseInt(req.query.runs || "5", 10);
  const genre = req.query.genre || "Action";
  const minYear = parseInt(req.query.minYear || "2010", 10);

  const query = { genres: genre, year: { $gte: minYear } };

  try {
    // verify source collection exists
    const srcExists = await db.listCollections({ name: SOURCE_COLL }).toArray();
    if (!srcExists.length) {
      const msg = `Source collection '${SOURCE_COLL}' does not exist.`;
      console.error(msg);
      return res.status(400).json({ error: msg });
    }
    let usedCollection = DEMO_COLL;
    const exists = await db.listCollections({ name: DEMO_COLL }).toArray();
    if (!exists.length) {
      if (copy) {
        const created = await ensureDemoCollection(db);
        usedCollection = DEMO_COLL;
        console.log("Demo collection created, method=", created.method);
      } else {
        // fallback to source collection but warn
        usedCollection = SOURCE_COLL;
      }
    }

    const coll = db.collection(usedCollection);

    // Drop index if exists for "before" demo
    const indexSpec = { genres: 1, year: -1 };
    await dropIndexIfExists(coll, indexSpec);

    // BEFORE
    let explainBefore, timesBefore;
    try {
      explainBefore = await getExplainFind(coll, query);
      timesBefore = await runTimedRuns(coll, query, runs);
    } catch (innerErr) {
      console.error("Error during BEFORE explain/timing:", innerErr);
      return res
        .status(500)
        .json({ error: String(innerErr), stack: innerErr.stack });
    }

    // create index
    let indexName = null;
    try {
      indexName = await coll.createIndex({ genres: 1, year: -1 });
    } catch (err) {
      console.error("createIndex failed:", err);
      return res.status(500).json({
        error: "createIndex failed: " + String(err.message),
        stack: err.stack,
      });
    }

    // AFTER
    let explainAfter, timesAfter, collStats;
    try {
      explainAfter = await getExplainFind(coll, query);
      timesAfter = await runTimedRuns(coll, query, runs);
      // collection stats via db.command collStats for broader driver compatibility
      collStats = await db.command({ collStats: usedCollection });
    } catch (innerErr) {
      console.error("Error during AFTER explain/timing/stats:", innerErr);
      return res
        .status(500)
        .json({ error: String(innerErr), stack: innerErr.stack });
    }

    // optionally drop index
    if (drop && indexName) {
      try {
        await coll.dropIndex(indexName);
      } catch (err) {
        // ignore
      }
    }

    return res.json({
      collection: usedCollection,
      query,
      explainBefore,
      timesBefore,
      explainAfter,
      timesAfter,
      medianBefore: median(timesBefore),
      medianAfter: median(timesAfter),
      indexName,
      collStats: {
        count: collStats.count,
        totalIndexSize: collStats.totalIndexSize,
        indexSizes: collStats.indexSizes,
      },
    });
  } catch (err) {
    console.error("compareIndex error:", err);
    return res.status(500).json({ error: String(err), stack: err.stack });
  }
}
