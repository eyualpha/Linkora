const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const { PORT, validateEnv } = require("./configs/env.config.js");
const connectDB = require("./configs/mongodb.config.js");
const ensureDB = require("./middlewares/ensureDB.middleware.js");

const authRouter = require("./routes/auth.route.js");
const userRouter = require("./routes/user.route.js");
const postRouter = require("./routes/post.route.js");
const commentRouter = require("./routes/comment.route.js");
const followRouter = require("./routes/follow.route.js");

validateEnv();

const app = express();

app.use(
  cors({
    origin: ["https://link-ora.vercel.app", "http://localhost:5173"],
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", ensureDB);

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/comments", commentRouter);
app.use("/api/follows", followRouter);

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  if (err && err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({ message: err.message });
  }

  res.status(500).json({ message: "Internal server error" });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

if (process.env.VERCEL) {
  module.exports = app;
} else {
  startServer();
  module.exports = app;
}
