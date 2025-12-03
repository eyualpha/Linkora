const Post = require("../models/post.model");
const Comment = require("../models/comment.model");

const createPost = async (req, res) => {
  try {
    const { text } = req.body;

    const images = req.files
      ? req.files.map((file) => `/uploads/posts/${file.filename}`)
      : [];

    const newPost = await Post.create({
      author: req.user.id,
      text,
      images,
    });

    return res.status(201).json({
      message: "Post created successfully",
      post: newPost,
    });
  } catch (error) {
    console.error("Create Post Error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    const { text, removeImages } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this post" });
    }

    if (text !== undefined) {
      post.text = text;
    }

    if (removeImages) {
      const toRemove = Array.isArray(removeImages.toString())
        ? removeImages
        : [removeImages];

      post.images = post.images.filter((img) => !toRemove.includes(img));
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(
        (file) => `/uploads/posts/${file.filename}`
      );
      post.images.push(...newImages);
    }

    await post.save();

    res.json({
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    console.error("Update Post Error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "fullname username profilePicture")
      .sort({ createdAt: -1 });
    return res.status(200).json({ posts });
  } catch (error) {
    console.error("Get Posts Error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "fullname username profilePicture"
    );

    const comments = await Comment.find({ post: post._id })
      .populate("author", "username fullname profilePicture")
      .sort({ createdAt: -1 });
    post.comments = comments;

    return res.status(200).json({ post });
  } catch (error) {
    console.error("Get Post Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

const getPostsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const posts = await Post.find({ author: userId })
      .populate("author", "fullname username profilePicture")
      .sort({ createdAt: -1 });
    return res.json({ posts });
  } catch (error) {
    console.error("Get Posts By User ID Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden." });
    }
    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();

    return res.status(200).json({ message: "Post deleted successfully." });
  } catch (error) {
    console.error("Delete Post Error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  deletePost,
  updatePost,
  getPostsByUserId,
};
