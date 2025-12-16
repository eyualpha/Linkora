const express = require("express");
const { isAuthenticated } = require("../middlewares/auth.middleware");
const {
  addComment,
  deleteComment,
  getComments,
} = require("../controllers/comment.controller");

const commentRouter = express.Router();

commentRouter.get("/", (req, res) => {
  res.send("Get all comments");
});
commentRouter.post("/:postId", isAuthenticated, addComment);
commentRouter.get("/:postId", getComments);
commentRouter.put("/:id", (req, res) => {
  res.send(`Update comment with ID: ${req.params.id}`);
});
commentRouter.delete("/:id", isAuthenticated, deleteComment);

module.exports = commentRouter;
