const express = require("express");
const {
  followUser,
  unfollowUser,
  checkFollowStatus,
  getUserFollowers,
  getUserFollowings,
} = require("../controllers/follow.controller");
const { isAuthenticated } = require("../middlewares/auth.middleware");

const followRouter = express.Router();

followRouter.post("/follow/:userId", isAuthenticated, followUser);
followRouter.post("/unfollow/:userId", isAuthenticated, unfollowUser);

followRouter.get("/status/:userId", isAuthenticated, checkFollowStatus);
followRouter.get("/:userId/followers", isAuthenticated, getUserFollowers);
followRouter.get("/:userId/followings", isAuthenticated, getUserFollowings);

module.exports = followRouter;

/**
 * @swagger
 * tags:
 *   name: Follow
 *   description: User follow & unfollow system
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     FollowStatus:
 *       type: object
 *       properties:
 *         isFollowing:
 *           type: boolean
 *           example: true
 *
 *     FollowUser:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "You are now following this user."
 *
 *     UnfollowUser:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "You have unfollowed this user."
 *
 *     FollowListUser:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "67aa12cd123a1223ab440011"
 *         fullname:
 *           type: string
 *           example: "John Doe"
 *         username:
 *           type: string
 *           example: "johndoe"
 *         profilePicture:
 *           type: string
 *           example: "https://cdn.linkora.com/uploads/profile.jpg"
 */

/**
 * @swagger
 * /follow/follow/{userId}:
 *   post:
 *     summary: Follow a user
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to follow
 *     responses:
 *       200:
 *         description: Successfully followed user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FollowUser'
 *       400:
 *         description: Cannot follow yourself or already following
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /follow/unfollow/{userId}:
 *   post:
 *     summary: Unfollow a user
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to unfollow
 *     responses:
 *       200:
 *         description: Successfully unfollowed user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnfollowUser'
 *       400:
 *         description: You are not following this user
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /follow/status/{userId}:
 *   get:
 *     summary: Check if the authenticated user follows the target user
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID to check follow status for
 *     responses:
 *       200:
 *         description: Follow status result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FollowStatus'
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /follow/{userId}/followers:
 *   get:
 *     summary: Get the list of followers for a user
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID whose followers are being fetched
 *     responses:
 *       200:
 *         description: List of followers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FollowListUser'
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /follow/{userId}/followings:
 *   get:
 *     summary: Get the list of users that the user is following
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID whose followings are being fetched
 *     responses:
 *       200:
 *         description: List of followings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FollowListUser'
 *       404:
 *         description: User not found
 */
