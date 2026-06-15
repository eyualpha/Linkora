const mongoose = require("mongoose");
const dns = require("dns");
const { MONGO_URI } = require("./env.config.js");

dns.setDefaultResultOrder("ipv4first");

let cachedPromise;

const formatMongoError = (error) => {
  const message = error?.message || "Unknown MongoDB error";

  if (/whitelist|IP that isn't whitelisted/i.test(message)) {
    return [
      "MongoDB Atlas rejected the connection (IP not whitelisted).",
      "Fix: Atlas -> Network Access -> Add IP Address.",
      "Use your current public IP, or 0.0.0.0/0 for local development.",
      "If you use a VPN, whitelist the VPN exit IP or disconnect the VPN.",
    ].join(" ");
  }

  if (/Server selection timed out|ReplicaSetNoPrimary/i.test(message)) {
    return [
      "MongoDB Atlas is unreachable from this network.",
      "Common causes: IP not whitelisted, VPN/firewall blocking port 27017, or cluster paused.",
      "Check Atlas -> Network Access and Database cluster status.",
    ].join(" ");
  }

  if (/bad auth|Authentication failed/i.test(message)) {
    return [
      "MongoDB authentication failed.",
      "Verify MONGO_URI username/password in Atlas -> Database Access.",
    ].join(" ");
  }

  return message;
};

const connectDB = async () => {
  if (!MONGO_URI) {
    throw new Error(
      "MONGO_URI is not set; add it to your environment variables."
    );
  }

  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (!cachedPromise) {
    cachedPromise = mongoose
      .connect(MONGO_URI, {
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        family: 4,
        maxPoolSize: 10,
      })
      .then(() => {
        console.log(`MongoDB connected (${mongoose.connection.name})`);
        return mongoose.connection;
      })
      .catch((error) => {
        cachedPromise = null;
        const helpful = formatMongoError(error);
        console.error("MongoDB connection failed:", helpful);
        throw new Error(helpful);
      });
  }

  return cachedPromise;
};

module.exports = connectDB;
