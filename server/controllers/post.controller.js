const Post = require("../models/post.model");
const Comment = require("../models/comment.model");
const {
  deleteCloudinaryAssets,
} = require("../utils/cloudinary.util");
const { getPagination, paginatedResponse } = require("../utils/pagination");

const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    const uploadedFiles = Array.isArray(req.files) ? req.files : [];

    if (!text && uploadedFiles.length === 0) {
      return res
        .status(400)
        .json({ message: "Post must include text or an image." });
    }

    const files = uploadedFiles.map((file) => ({
      url: file.path,
      public_id: file.filename,
      resource_type: file.detectedType || "image",
    }));

    const newPost = await Post.create({
      author: req.user.id,
      ...(text ? { text } : {}),
      ...(files.length ? { files } : {}),
    });

    return res.status(201).json({
      message: "Post created successfully",
      post: newPost,
    });
  } catch (error) {
    console.error("Create Post Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

const updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    const { text, removeFiles } = req.body;

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

    if (removeFiles) {
      const toRemove = Array.isArray(removeFiles) ? removeFiles : [removeFiles];
      const removedFiles = (post.files || []).filter(
        (file) =>
          toRemove.includes(file.public_id) || toRemove.includes(file.url)
      );

      await deleteCloudinaryAssets(removedFiles);

      post.files = (post.files || []).filter(
        (file) =>
          !toRemove.includes(file.public_id) && !toRemove.includes(file.url)
      );
    }

    if (req.files && req.files.length > 0) {
      const newFiles = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
        resource_type: file.detectedType || "image",
      }));

      const updatedFiles = [...(post.files || []), ...newFiles];

      if (updatedFiles.length > 2) {
        return res
          .status(400)
          .json({ message: "A post can have at most 2 images." });
      }

      post.files = updatedFiles;
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
    const { page, limit, skip } = getPagination(req);

    const [posts, total] = await Promise.all([
      Post.find()
        .populate("author", "fullname username profilePicture")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments(),
    ]);

    const { pagination } = paginatedResponse(posts, total, page, limit);
    return res.status(200).json({ posts, pagination });
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

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comments = await Comment.find({ postId: post._id })
      .populate("author", "username fullname profilePicture")
      .sort({ createdAt: -1 });

    return res.status(200).json({ post: { ...post.toObject(), comments } });
  } catch (error) {
    console.error("Get Post Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

const getPostsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { page, limit, skip } = getPagination(req);

    const [posts, total] = await Promise.all([
      Post.find({ author: userId })
        .populate("author", "fullname username profilePicture")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments({ author: userId }),
    ]);

    const { pagination } = paginatedResponse(posts, total, page, limit);
    return res.json({ posts, pagination });
  } catch (error) {
    console.error("Get Posts By User ID Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

const getTrendingPosts = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [posts, totalResult] = await Promise.all([
      Post.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        { $addFields: { likesCount: { $size: "$likes" } } },
        { $sort: { likesCount: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "author",
          },
        },
        { $unwind: "$author" },
        {
          $project: {
            text: 1,
            files: 1,
            likes: 1,
            likesCount: 1,
            createdAt: 1,
            updatedAt: 1,
            "author._id": 1,
            "author.fullname": 1,
            "author.username": 1,
            "author.profilePicture": 1,
          },
        },
      ]),
      Post.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    ]);

    const { pagination } = paginatedResponse(posts, totalResult, page, limit);
    return res.status(200).json({ posts, pagination });
  } catch (error) {
    console.error("Get Trending Posts Error:", error);
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

    await deleteCloudinaryAssets(post.files || []);
    await Comment.deleteMany({ postId: post._id });
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
  getTrendingPosts,
};
