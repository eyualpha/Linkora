const express = require("express");
const { isAuthenticated } = require("../middlewares/auth.middleware");
const {
  addComment,
  deleteComment,
  getComments,
  getCommentsByPostId,
} = require("../controllers/comment.controller");

const commentRouter = express.Router();

commentRouter.get("/", getComments);
commentRouter.post("/:postId", isAuthenticated, addComment);
commentRouter.get("/:postId", getCommentsByPostId);
commentRouter.put("/:id", (req, res) => {
  res.send(`Update comment with ID: ${req.params.id}`);
});
commentRouter.delete("/:id", isAuthenticated, deleteComment);

module.exports = commentRouter;
