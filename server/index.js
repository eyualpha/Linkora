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

const app = express();

app.use(express.json());
app.use(cors({ origin: "https://link-ora.vercel.app", credentials: true }));
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
// app.use((err, req, res, next) => {
//   console.error("Unhandled error:", err);

//   if (err instanceof multer.MulterError) {
//     return res.status(400).json({ message: err.message });
//   }
//   if (err && err.message) {
//     return res.status(500).json({ message: err.message });
//   }
//   res.status(500).json({ message: "Internal server error" });
// });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});

module.exports = app;
