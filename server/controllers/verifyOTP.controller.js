const User = require("../models/user.model");
const { findUserById } = require("./user.controller");
const { generateOTP } = require("../utils/generateOTP");
const sendOTP = require("../utils/sendOTP");
const { OTP_EXPIRY_MS } = require("../configs/env.config");

const isOtpExpired = (expiresAt) => {
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() < Date.now();
};

const verifyRegistrationOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ message: "User ID and OTP are required." });
    }

    const user = await findUserById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified." });
    }

    if (user.otp.code !== otp || isOtpExpired(user.otp.expiresAt)) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    return res.status(200).json({
      message: "OTP verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email & OTP required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (
      !user.resetPasswordOTP ||
      user.resetPasswordOTP !== otp ||
      isOtpExpired(user.resetPasswordOTPExpires)
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const resendRegistrationOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified." });
    }

    const otpCode = generateOTP();
    user.otp = {
      code: otpCode,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
    };
    await user.save();

    await sendOTP(user.email, "Linkora - Verify Your Email", otpCode);

    return res.status(200).json({
      message: "A new verification code has been sent to your email.",
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    return res.status(503).json({
      message: "Failed to send verification email. Please try again later.",
    });
  }
};

module.exports = {
  verifyRegistrationOTP,
  verifyResetOTP,
  resendRegistrationOTP,
};
