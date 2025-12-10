const express = require("express");
const {
  register,
  login,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");
const {
  verifyRegistrationOTP,
  verifyResetOTP,
} = require("../controllers/verifyOTP.controller");
const isAdmin = require("../middlewares/isAdmin");
const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/verify-otp", verifyRegistrationOTP);

authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/verify-reset-otp", verifyResetOTP);
authRouter.post("/reset-password", resetPassword);

module.exports = authRouter;

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication, OTP verification, and password reset
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterInput:
 *       type: object
 *       required:
 *         - fullname
 *         - username
 *         - email
 *         - password
 *       properties:
 *         fullname:
 *           type: string
 *           example: "Eyu Ashenafi"
 *         username:
 *           type: string
 *           example: "eyu_dev"
 *         email:
 *           type: string
 *           example: "example@gmail.com"
 *         password:
 *           type: string
 *           example: "MyPassword123"
 *
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: "example@gmail.com"
 *         password:
 *           type: string
 *           example: "MyPassword123"
 *
 *     OTPInput:
 *       type: object
 *       required:
 *         - email
 *         - otp
 *       properties:
 *         email:
 *           type: string
 *           example: "example@gmail.com"
 *         otp:
 *           type: string
 *           example: "542981"
 *
 *     ForgotPasswordInput:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           example: "example@gmail.com"
 *
 *     ResetPasswordInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - token
 *       properties:
 *         email:
 *           type: string
 *           example: "example@gmail.com"
 *         token:
 *           type: string
 *           example: "a1b2c3d4e5f6"
 *         password:
 *           type: string
 *           example: "NewStrongPassword123"
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: User registered successfully (OTP sent)
 *       400:
 *         description: Validation error or user already exists
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful (JWT returned)
 *       400:
 *         description: Invalid login credentials
 */

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify registration OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OTPInput'
 *     responses:
 *       200:
 *         description: Account verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Send OTP for password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordInput'
 *     responses:
 *       200:
 *         description: Password reset OTP sent to email
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /auth/verify-reset-otp:
 *   post:
 *     summary: Verify OTP for password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OTPInput'
 *     responses:
 *       200:
 *         description: OTP verified, token generated
 *       400:
 *         description: Invalid or expired OTP
 */

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset user password using token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordInput'
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired reset token
 */
