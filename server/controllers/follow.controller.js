const Follow = require("../models/follow.model");
const User = require("../models/user.model");
const { getPagination, paginatedResponse } = require("../utils/pagination");
const { createNotification } = require("../utils/notifications.util");

const followUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const followingId = req.params.userId;

    if (followerId === followingId) {
      return res.status(400).json({ message: "You cannot follow yourself." });
    }

    const targetUser = await User.findById(followingId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found." });
    }

    await Follow.create({
      follower: followerId,
      following: followingId,
    });

    await Promise.all([
      User.findByIdAndUpdate(followingId, {
        $addToSet: { followers: followerId },
      }),
      User.findByIdAndUpdate(followerId, {
        $addToSet: { following: followingId },
      }),
    ]);

    const follower = await User.findById(followerId).select("username");
    await createNotification({
      recipientId: followingId,
      senderId: followerId,
      type: "follow",
      message: `${follower?.username || "Someone"} started following you`,
    });

    res.status(201).json({ message: "User followed successfully." });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Already following this user." });
    }
    console.error("Follow Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const followingId = req.params.userId;

    const deleted = await Follow.findOneAndDelete({
      follower: followerId,
      following: followingId,
    });

    if (!deleted) {
      return res
        .status(400)
        .json({ message: "You are not following this user." });
    }

    await Promise.all([
      User.findByIdAndUpdate(followingId, {
        $pull: { followers: followerId },
      }),
      User.findByIdAndUpdate(followerId, {
        $pull: { following: followingId },
      }),
    ]);

    res.json({ message: "User unfollowed successfully." });
  } catch (error) {
    console.error("Unfollow Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const checkFollowStatus = async (req, res) => {
  try {
    const followerId = req.user.id;
    const followingId = req.params.userId;

    if (followerId === followingId) {
      return res.json({ isFollowing: false });
    }

    const exists = await Follow.exists({
      follower: followerId,
      following: followingId,
    });

    res.json({ isFollowing: Boolean(exists) });
  } catch (error) {
    console.error("Check Follow Status Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserFollowers = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const { page, limit, skip } = getPagination(req);

    const [followers, total] = await Promise.all([
      Follow.find({ following: userId })
        .populate("follower", "fullname username profilePicture _id")
        .select("-_id follower createdAt")
        .skip(skip)
        .limit(limit),
      Follow.countDocuments({ following: userId }),
    ]);

    const { pagination } = paginatedResponse(followers, total, page, limit);
    res.json({ followers, pagination });
  } catch (error) {
    console.error("Get Followers Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserFollowings = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const { page, limit, skip } = getPagination(req);

    const [followings, total] = await Promise.all([
      Follow.find({ follower: userId })
        .populate("following", "fullname username profilePicture _id")
        .select("-_id following createdAt")
        .skip(skip)
        .limit(limit),
      Follow.countDocuments({ follower: userId }),
    ]);

    const { pagination } = paginatedResponse(followings, total, page, limit);
    res.json({ followings, pagination });
  } catch (error) {
    console.error("Get Followings Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUsersNotFollowed = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { page, limit, skip } = getPagination(req);

    const followingDocs = await Follow.find({ follower: currentUserId }).select(
      "following -_id"
    );
    const followingIds = followingDocs.map((doc) => doc.following);

    const filter = {
      _id: { $ne: currentUserId, $nin: followingIds },
    };

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("fullname username profilePicture _id")
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    const { pagination } = paginatedResponse(users, total, page, limit);
    res.json({ users, pagination });
  } catch (error) {
    console.error("Get Users Not Followed Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  followUser,
  unfollowUser,
  checkFollowStatus,
  getUserFollowers,
  getUserFollowings,
  getUsersNotFollowed,
};
