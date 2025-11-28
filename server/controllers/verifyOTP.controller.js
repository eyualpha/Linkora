exports.verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ message: "User ID and OTP are required." });
    }

    // 1. Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    // 2. Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified." });
    }

    // 3. Validate OTP
    if (user.otp.code !== otp || user.otp.expiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // 4. Mark account as verified
    user.isVerified = true;
    user.otp = undefined; // remove OTP
    await user.save();

    return res.status(200).json({
      message: "OTP verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    res.status(500).json({ message: "Server error." });
  }
};
