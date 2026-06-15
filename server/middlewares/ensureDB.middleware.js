const connectDB = require("../configs/mongodb.config");

const ensureDB = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection error:", err.message || err);
    const payload = { message: "Database unavailable" };
    if (process.env.NODE_ENV !== "production") {
      payload.detail = err.message;
    }
    res.status(503).json(payload);
  }
};

module.exports = ensureDB;
