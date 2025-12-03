const Post = require("../models/post.model");

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
    return res.status(200).json({ post });
  } catch (error) {
    console.error("Get Post Error:", error);
    res.status(500).json({ message: "Server error." });
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
    await post.deleteOne();
    return res.status(200).json({ message: "Post deleted successfully." });
  } catch (error) {
    console.error("Delete Post Error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { createPost, getPosts, getPostById, deletePost };
