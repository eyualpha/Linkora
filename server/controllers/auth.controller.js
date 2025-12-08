const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateOTP } = require("../utils/generateOTP");
const sendOTP = require("../utils/sendOTP");

const register = async (req, res) => {
  try {
    const { fullname, username, email, password, gender } = req.body;

    if (!fullname || !username || !email || !password || !gender) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otpCode = generateOTP();
    const otpExpiry = Date.now() + 1000 * 60 * 10;

    const newUser = await User.create({
      fullname,
      username,
      email,
      gender,
      password: hashedPassword,
      otp: {
        code: otpCode,
        expiresAt: otpExpiry,
      },
    });

    try {
      await sendOTP(email, "Linkora - Verify Your Email", otpCode);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    return res.status(201).json({
      message: "Registration successful! OTP sent to your email.",
      userId: newUser._id,
    });
  } catch (error) {
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

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const safeUser = {
      _id: user._id,
      fullname: user.fullname,
      username: user.username,
      email: user.email,
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
    if (!user)
      return res
        .status(404)
        .json({ message: "User with this email not found" });

    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000;

    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = otpExpiry;

    await user.save();

    await sendOTP(email, "Linkora - Password Reset OTP", otp);

    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword)
      return res
        .status(400)
        .json({ message: "Email, OTP, and new password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (
      !user.resetPasswordOTP ||
      user.resetPasswordOTP !== otp ||
      user.resetPasswordOTPExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

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
