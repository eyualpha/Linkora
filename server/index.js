const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");

const { PORT } = require("./configs/env.config.js");
const connectDB = require("./configs/mongodb.config.js");

const authRouter = require("./routes/auth.route.js");
const userRouter = require("./routes/user.route.js");
const postRouter = require("./routes/post.route.js");
const commentRouter = require("./routes/comment.route.js");
const followRouter = require("./routes/follow.route.js");

connectDB(); // Initial DB connection

const app = express();

app.use(express.json());
// Ensure DB is connected before handling requests; cached connectDB keeps this fast.
// app.use(async (req, res, next) => {
//   try {
//     await connectDB();
//     next();
//   } catch (err) {
//     next(err);
//   }
// });

app.use(
  cors({
    origin: ["https://link-ora.vercel.app", "http://localhost:5173"],
    credentials: true,
  })
);
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/comments", commentRouter);
app.use("/api/follows", followRouter);

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  // Keep multer-specific handling if file uploads fail.
  if (err && err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({ message: err.message });
  }

  const message = err && err.message ? err.message : "Internal server error";
  res.status(500).json({ message });
});

if (process.env.VERCEL) {
  // Vercel serverless: export the app without starting a listener.
  module.exports = app;
} else {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  module.exports = app;
}
