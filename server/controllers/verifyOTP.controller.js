const User = require("../models/user.model");
const { getUserById } = require("./user.controller");

const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ message: "User ID and OTP are required." });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified." });
    }

    if (user.otp.code !== otp || user.otp.expiresAt < Date.now()) {
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

module.exports = {
  verifyOTP,
};
