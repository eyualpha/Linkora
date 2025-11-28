const express = require("express");

const commentRouter = express.Router();

commentRouter.get("/", (req, res) => {
  res.send("Get all comments");
});
commentRouter.post("/", (req, res) => {
  res.send("Create a new comment");
});
commentRouter.get("/:id", (req, res) => {
  res.send(`Get comment with ID: ${req.params.id}`);
});
commentRouter.put("/:id", (req, res) => {
  res.send(`Update comment with ID: ${req.params.id}`);
});
commentRouter.delete("/:id", (req, res) => {
  res.send(`Delete comment with ID: ${req.params.id}`);
});

module.exports = commentRouter;
