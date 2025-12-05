const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const fs = require("fs");

const { PORT } = require("./configs/env.config.js");
const connectDB = require("./configs/mongodb.config.js");

const authRouter = require("./routes/auth.route.js");
const userRouter = require("./routes/user.route.js");
const postRouter = require("./routes/post.route.js");
const commentRouter = require("./routes/comment.route.js");
const followRouter = require("./routes/follow.route.js");

const app = express();

app.use(express.json());
app.use(cors());
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

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
