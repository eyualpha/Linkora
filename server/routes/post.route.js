const express = require("express");
const {
  createPost,
  getPosts,
  getPostById,
  deletePost,
} = require("../controllers/post.controller");
const { isAuthenticated } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload");

const postRouter = express.Router();

postRouter.get("/", isAuthenticated, getPosts);
postRouter.post("/", isAuthenticated, upload.array("images", 5), createPost);
postRouter.get("/:id", isAuthenticated, getPostById);

postRouter.put("/:id", (req, res) => {
  res.send(`Update post with ID: ${req.params.id}`);
});
postRouter.delete("/:id", isAuthenticated, deletePost);

module.exports = postRouter;
