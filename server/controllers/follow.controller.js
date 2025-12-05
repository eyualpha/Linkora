const Follow = require("../models/follow.model");

const followUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const followingId = req.params.userId;

    if (followerId === followingId) {
      return res.status(400).json({ message: "You cannot follow yourself." });
    }

    const alreadyFollowing = await Follow.findOne({
      follower: followerId,
      following: followingId,
    });

    if (alreadyFollowing) {
      return res
        .status(400)
        .json({ message: "You are already following this user." });
    }

    await Follow.create({ follower: followerId, following: followingId });

    res.json({ message: "Followed successfully." });
  } catch (error) {
    console.error("Follow Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const userIdToUnfollow = req.params.userId;
    const currentUserId = req.user.id;

    const existingFollow = await Follow.findOne({
      follower: currentUserId,
      following: userIdToUnfollow,
    });

    if (!existingFollow) {
      return res
        .status(400)
        .json({ message: "You are not following this user" });
    }

    await Follow.findOneAndDelete({
      follower: currentUserId,
      following: userIdToUnfollow,
    });
    res.json({ message: "User unfollowed successfully" });
  } catch (error) {
    console.error("Unfollow User Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  followUser,
  unfollowUser,
};
