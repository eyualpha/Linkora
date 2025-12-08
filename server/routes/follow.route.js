const express = require("express");
const {
  followUser,
  unfollowUser,
  checkFollowStatus,
  getUserFollowers,
  getUserFollowings,
} = require("../controllers/follow.controller");
const { isAuthenticated } = require("../middlewares/auth.middleware");

const followRouter = express.Router();

followRouter.post("/follow/:userId", isAuthenticated, followUser);
followRouter.post("/unfollow/:userId", isAuthenticated, unfollowUser);

followRouter.get("/status/:userId", isAuthenticated, checkFollowStatus);
followRouter.get("/:userId/followers", isAuthenticated, getUserFollowers);
followRouter.get("/:userId/followings", isAuthenticated, getUserFollowings);

module.exports = followRouter;
