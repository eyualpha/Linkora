const express = require("express");
const {
  savePost,
  unsavePost,
  getSavedPosts,
  checkSavedStatus,
} = require("../controllers/saved.controller");
const { isAuthenticated } = require("../middlewares/auth.middleware");

const savedRouter = express.Router();

savedRouter.get("/", isAuthenticated, getSavedPosts);
savedRouter.get("/posts/:postId/status", isAuthenticated, checkSavedStatus);
savedRouter.post("/posts/:postId", isAuthenticated, savePost);
savedRouter.delete("/posts/:postId", isAuthenticated, unsavePost);

module.exports = savedRouter;
