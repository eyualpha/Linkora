const express = require("express");
const multer = require("multer");

const postRouter = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

postRouter.get("/", (req, res) => {
  res.send("Get all posts");
});
postRouter.post("/", (req, res) => {
  res.send("Create a new post");
});
postRouter.get("/:id", (req, res) => {
  res.send(`Get post with ID: ${req.params.id}`);
});
postRouter.put("/:id", (req, res) => {
  res.send(`Update post with ID: ${req.params.id}`);
});
postRouter.delete("/:id", (req, res) => {
  res.send(`Delete post with ID: ${req.params.id}`);
});

module.exports = postRouter;
