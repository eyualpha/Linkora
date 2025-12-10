const express = require("express");
const {
  createPost,
  getPosts,
  getPostById,
  deletePost,
  updatePost,
  getPostsByUserId,
} = require("../controllers/post.controller");
const { isAuthenticated } = require("../middlewares/auth.middleware");
const { toggleLike } = require("../controllers/like.controller");
const upload = require("../middlewares/upload");

const postRouter = express.Router();

postRouter.get("/", isAuthenticated, getPosts);
postRouter.post("/", isAuthenticated, upload.array("file", 2), createPost);

postRouter.get("/:id", isAuthenticated, getPostById);
postRouter.put("/:id", isAuthenticated, upload.array("file", 2), updatePost);
postRouter.delete("/:id", isAuthenticated, deletePost);

postRouter.put("/like/:id", isAuthenticated, toggleLike);
postRouter.get("/user/:userId", isAuthenticated, getPostsByUserId);

module.exports = postRouter;

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Post management and user feed
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         author:
 *           type: string
 *         text:
 *           type: string
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         likes:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *
 *     CreatePostInput:
 *       type: object
 *       properties:
 *         text:
 *           type: string
 *           example: "My new post!"
 *
 *     UpdatePostInput:
 *       type: object
 *       properties:
 *         text:
 *           type: string
 *           example: "Updated post content"
 *         removeImages:
 *           type: array
 *           items:
 *             type: string
 *           example: ["/uploads/posts/img123.jpg"]
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all posts (user feed)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               file:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get a post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               removeImages:
 *                 type: array
 *                 items:
 *                   type: string
 *               file:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       404:
 *         description: Post not found
 *       403:
 *         description: Not authorized
 */

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       404:
 *         description: Post not found
 *       403:
 *         description: Not authorized
 */

/**
 * @swagger
 * /posts/like/{id}:
 *   put:
 *     summary: Like/unlike a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like status toggled
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /posts/user/{userId}:
 *   get:
 *     summary: Get posts by a specific user
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User's posts retrieved
 *       404:
 *         description: User or posts not found
 */
