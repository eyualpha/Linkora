const Post = require("../models/post.model");
const User = require("../models/user.model");
const { createNotification } = require("../utils/notifications.util");

const toggleLike = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const existing = await Post.findById(postId).select("likes author");
    if (!existing) return res.status(404).json({ message: "Post not found" });

    const isLiked = existing.likes.some((id) => id.toString() === userId);

    const updated = await Post.findByIdAndUpdate(
      postId,
      isLiked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } },
      { new: true }
    ).select("likes");

    if (!isLiked) {
      const sender = await User.findById(userId).select("username");
      await createNotification({
        recipientId: existing.author,
        senderId: userId,
        type: "like",
        postId,
        message: `${sender?.username || "Someone"} liked your post`,
      });
    }

    return res.json({
      message: isLiked ? "Post unliked" : "Post liked",
      likesCount: updated.likes.length,
      isLiked: !isLiked,
    });
  } catch (error) {
    console.error("Toggle Like Error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { toggleLike };
