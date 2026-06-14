const Comment = require("../models/comment.model");
const Post = require("../models/post.model");
const { getPagination, paginatedResponse } = require("../utils/pagination");

const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = await Comment.create({
      postId,
      author: userId,
      content,
    });

    res.status(201).json({
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    console.error("Add Comment Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (comment.author.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    await Comment.findByIdAndDelete(id);
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete Comment Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getCommentsByPostId = async (req, res) => {
  try {
    const { postId } = req.params;
    if (!postId) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required",
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const { page, limit, skip } = getPagination(req);

    const [comments, total] = await Promise.all([
      Comment.find({ postId })
        .populate("author", "username profilePicture fullname")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Comment.countDocuments({ postId }),
    ]);

    const { pagination } = paginatedResponse(comments, total, page, limit);
    return res.status(200).json({
      success: true,
      count: total,
      data: comments,
      pagination,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
    });
  }
};

module.exports = {
  addComment,
  deleteComment,
  getCommentsByPostId,
};
