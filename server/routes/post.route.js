const express = require("express");
const {
  createPost,
  getPosts,
  getPostById,
  deletePost,
  updatePost,
  getPostsByUserId,
} = require("../controllers/post.controller");
const { isAuthenticated } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload");
const { toggleLike } = require("../controllers/like.controller");

const postRouter = express.Router();

postRouter.get("/", isAuthenticated, getPosts);
postRouter.post("/", isAuthenticated, upload.array("images", 5), createPost);

postRouter.get("/:id", isAuthenticated, getPostById);
postRouter.put("/:id", isAuthenticated, upload.array("images", 5), updatePost);
postRouter.delete("/:id", isAuthenticated, deletePost);

postRouter.put("/like/:id", isAuthenticated, toggleLike);
postRouter.get("/user/:userId", isAuthenticated, getPostsByUserId);

module.exports = postRouter;
