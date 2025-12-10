const express = require("express");
const { isAuthenticated } = require("../middlewares/auth.middleware");
const { updateProfile } = require("../controllers/user.controller");
const upload = require("../middlewares/upload");

const userRouter = express.Router();

const uploadFields = upload.fields([
  { name: "profilePicture", maxCount: 1 },
  { name: "coverPicture", maxCount: 1 },
]);

userRouter.put("/update-profile", isAuthenticated, uploadFields, updateProfile);

module.exports = userRouter;

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User profile management APIs
 */

/**
 * @swagger
 * /users/update-profile:
 *   put:
 *     summary: Update authenticated user's profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "Eyu Ashenafi"
 *               bio:
 *                 type: string
 *                 example: "Full-stack developer and tech enthusiast"
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *               coverPicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *                 user:
 *                   type: object
 *                   description: Updated user profile data
 *       400:
 *         description: Invalid input or missing fields
 *       401:
 *         description: Unauthorized – user must be logged in
 *       500:
 *         description: Server error
 */
