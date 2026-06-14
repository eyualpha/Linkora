const SavedPost = require("../models/savedPost.model");
const Post = require("../models/post.model");
const { getPagination, paginatedResponse } = require("../utils/pagination");

const savePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const existing = await SavedPost.findOne({ user: userId, post: postId });
    if (existing) {
      return res.status(400).json({ message: "Post already saved." });
    }

    await SavedPost.create({ user: userId, post: postId });

    return res.status(201).json({ message: "Post saved successfully." });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Post already saved." });
    }
    console.error("Save Post Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

const unsavePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    const deleted = await SavedPost.findOneAndDelete({
      user: userId,
      post: postId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Saved post not found." });
    }

    return res.status(200).json({ message: "Post removed from saved." });
  } catch (error) {
    console.error("Unsave Post Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

const getSavedPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, limit, skip } = getPagination(req);

    const [saved, total] = await Promise.all([
      SavedPost.find({ user: userId })
        .populate({
          path: "post",
          populate: {
            path: "author",
            select: "fullname username profilePicture",
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      SavedPost.countDocuments({ user: userId }),
    ]);

    const posts = saved.map((s) => s.post).filter(Boolean);
    const { pagination } = paginatedResponse(posts, total, page, limit);

    return res.status(200).json({ posts, pagination });
  } catch (error) {
    console.error("Get Saved Posts Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

const checkSavedStatus = async (req, res) => {
  try {
    const exists = await SavedPost.exists({
      user: req.user.id,
      post: req.params.postId,
    });

    return res.status(200).json({ isSaved: Boolean(exists) });
  } catch (error) {
    console.error("Check Saved Status Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  savePost,
  unsavePost,
  getSavedPosts,
  checkSavedStatus,
};
