const express = require("express");
const { isAuthenticated } = require("../middlewares/auth.middleware");
const {
  addComment,
  deleteComment,
  getComments,
} = require("../controllers/comment.controller");

const commentRouter = express.Router();

commentRouter.get("/", (req, res) => {
  res.send("Get all comments");
});
commentRouter.post("/:postId", isAuthenticated, addComment);
commentRouter.get("/:postId", getComments);
commentRouter.put("/:id", (req, res) => {
  res.send(`Update comment with ID: ${req.params.id}`);
});
commentRouter.delete("/:id", isAuthenticated, deleteComment);

module.exports = commentRouter;

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Comment management for posts
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CommentInput:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           example: "This is a comment on the post."
 *
 *     Comment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "67aa234df9a1b2c3d4e5f6a1"
 *         postId:
 *           type: string
 *           example: "67aa12cd123a1223ab445566"
 *         author:
 *           type: string
 *           example: "67aa12cd123a1223ab400111"
 *         content:
 *           type: string
 *           example: "This is my comment."
 *         likes:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 */

/**
 * @swagger
 * /comments/{postId}:
 *   post:
 *     summary: Add a comment to a post
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to comment on
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentInput'
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Post not found
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /comments/{postId}:
 *   get:
 *     summary: Get all comments for a post
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to fetch comments for
 *     responses:
 *       200:
 *         description: List of comments for the post
 *         content:
 *           application/json:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       403:
 *         description: Not authorized to delete this comment
 *       404:
 *         description: Comment not found
 */
