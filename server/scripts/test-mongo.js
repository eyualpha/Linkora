require("dotenv").config();
const dns = require("dns");
const { MongoClient } = require("mongodb");
const connectDB = require("../configs/mongodb.config.js");
const { MONGO_URI } = require("../configs/env.config.js");

dns.setDefaultResultOrder("ipv4first");

async function main() {
  if (!MONGO_URI) {
    console.error("MONGO_URI is not set in .env");
    process.exit(1);
  }

  const masked = MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@");
  console.log("Testing URI:", masked);
  console.log("");

  const client = new MongoClient(MONGO_URI, {
    serverSelectionTimeoutMS: 15000,
    family: 4,
  });

  try {
    await client.connect();
    const ping = await client.db().admin().command({ ping: 1 });
    console.log("[OK] Native driver connected, ping:", ping.ok);
  } catch (error) {
    console.error("[FAIL] Native driver:", error.message);
  } finally {
    await client.close().catch(() => {});
  }

  try {
    await connectDB();
    console.log("[OK] Mongoose connected");
  } catch (error) {
    console.error("[FAIL] Mongoose:", error.message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
