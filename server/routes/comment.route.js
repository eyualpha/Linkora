const express = require("express");
const { isAuthenticated } = require("../middlewares/auth.middleware");
const {
  addComment,
  deleteComment,
  getCommentsByPostId,
} = require("../controllers/comment.controller");

const commentRouter = express.Router();

commentRouter.post("/:postId", isAuthenticated, addComment);
commentRouter.get("/:postId", getCommentsByPostId);
commentRouter.delete("/:id", isAuthenticated, deleteComment);

module.exports = commentRouter;
