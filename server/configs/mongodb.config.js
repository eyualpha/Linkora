const mongoose = require("mongoose");
const { MONGO_URI } = require("./env.config.js");

// Cache the connection promise so Vercel serverless functions reuse it.
let cachedPromise;

const connectDB = async () => {
  if (!MONGO_URI) {
    throw new Error(
      "MONGO_URI is not set; add it to your environment variables."
    );
  }

  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!cachedPromise) {
    cachedPromise = mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 5,
    });
  }

  return cachedPromise;
};

module.exports = connectDB;
