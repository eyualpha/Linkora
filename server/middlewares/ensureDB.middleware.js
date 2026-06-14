const connectDB = require("../configs/mongodb.config");

const ensureDB = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection error:", err);
    res.status(503).json({ message: "Database unavailable" });
  }
};

module.exports = ensureDB;
