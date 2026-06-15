const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const { PORT, validateEnv, validateEmailConfig, RESEND_API_KEY } = require("./configs/env.config.js");
const connectDB = require("./configs/mongodb.config.js");
const { verifyEmailConnection } = require("./configs/nodemailer.config.js");
const ensureDB = require("./middlewares/ensureDB.middleware.js");

const authRouter = require("./routes/auth.route.js");
const userRouter = require("./routes/user.route.js");
const postRouter = require("./routes/post.route.js");
const commentRouter = require("./routes/comment.route.js");
const followRouter = require("./routes/follow.route.js");
const storyRouter = require("./routes/story.route.js");
const savedRouter = require("./routes/saved.route.js");
const notificationRouter = require("./routes/notification.route.js");

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
app.use("/api/stories", storyRouter);
app.use("/api/saves", savedRouter);
app.use("/api/notifications", notificationRouter);

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
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  connectDB().catch((err) => {
    console.error("MongoDB connection failed on startup:", err.message);
    console.error("API routes will return 503 until the database is available.");
  });

  if (validateEmailConfig()) {
    if (RESEND_API_KEY) {
      console.log("Resend API key detected — OTP emails will use Resend.");
    } else {
      verifyEmailConnection()
        .then((emailCheck) => {
          if (emailCheck.ok) {
            console.log("Email (SMTP) connection verified successfully.");
          } else {
            console.error("Email (SMTP) verification failed:", emailCheck.error);
          }
        })
        .catch((err) => {
          console.error("Email (SMTP) verification failed:", err.message);
        });
    }
  }
};

module.exports = app;

if (!process.env.VERCEL) {
  startServer();
}
