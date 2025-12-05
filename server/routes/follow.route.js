const express = require("express");
const {
  followUser,
  unfollowUser,
} = require("../controllers/follow.controller");
const { isAuthenticated } = require("../middlewares/auth.middleware");

const followRouter = express.Router();

followRouter.post("/follow/:userId", isAuthenticated, followUser);
followRouter.post("/unfollow/:userId", isAuthenticated, unfollowUser);

module.exports = followRouter;
