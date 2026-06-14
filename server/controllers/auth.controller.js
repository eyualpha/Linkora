const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateOTP } = require("../utils/generateOTP");
const sendOTP = require("../utils/sendOTP");
const {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  OTP_EXPIRY_MS,
  BCRYPT_SALT_ROUNDS,
  DEV_LOG_OTP,
} = require("../configs/env.config");

const register = async (req, res) => {
  try {
    const { fullname, username, email, password, gender } = req.body;

    if (!fullname || !username || !email || !password || !gender) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      if (existing.email === email.toLowerCase()) {
        return res.status(400).json({ message: "Email already exists." });
      }
      return res.status(400).json({ message: "Username already taken." });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const otpCode = generateOTP();
    const otpExpiry = Date.now() + OTP_EXPIRY_MS;

    const newUser = await User.create({
      fullname,
      username,
      email,
      gender,
      password: hashedPassword,
      otp: {
        code: otpCode,
        expiresAt: new Date(otpExpiry),
      },
    });

    try {
      await sendOTP(email, "Linkora - Verify Your Email", otpCode);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      await User.findByIdAndDelete(newUser._id);
      return res.status(503).json({
        message: "Failed to send verification email. Please try again.",
      });
    }

    return res.status(201).json({
      message: "Registration successful! OTP sent to your email.",
      userId: newUser._id,
      ...(DEV_LOG_OTP && { devOtp: otpCode }),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email or username already taken." });
    }
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email before logging in." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    const safeUser = {
      _id: user._id,
      fullname: user.fullname,
      username: user.username,
      email: user.email,
      gender: user.gender,
      isAdmin: user.isAdmin,
      profilePicture: user.profilePicture,
      coverPicture: user.coverPicture,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };

    return res.status(200).json({
      message: "Login successful!",
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });

    if (user) {
      const otp = generateOTP();
      user.resetPasswordOTP = otp;
      user.resetPasswordOTPExpires = Date.now() + OTP_EXPIRY_MS;
      await user.save();

      try {
        await sendOTP(email, "Linkora - Password Reset OTP", otp);
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        return res.status(503).json({ message: "Failed to send OTP email." });
      }
    }

    res.status(200).json({
      message: "If an account with that email exists, an OTP has been sent.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email, OTP, and new password required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (
      !user.resetPasswordOTP ||
      user.resetPasswordOTP !== otp ||
      user.resetPasswordOTPExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
    user.resetPasswordOTP = null;
    user.resetPasswordOTPExpires = null;

    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};
