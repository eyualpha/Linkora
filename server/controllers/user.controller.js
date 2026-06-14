const User = require("../models/user.model");
const { deleteCloudinaryByUrl } = require("../utils/cloudinary.util");

const toSafeUser = (user) => ({
  _id: user._id,
  fullname: user.fullname,
  username: user.username,
  email: user.email,
  bio: user.bio,
  profilePicture: user.profilePicture,
  coverPicture: user.coverPicture,
  followers: user.followers,
  following: user.following,
  isVerified: user.isVerified,
});

const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { fullname, bio, username } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (
      req.files?.profilePicture &&
      req.files.profilePicture.length > 0
    ) {
      if (user.profilePicture) {
        await deleteCloudinaryByUrl(user.profilePicture);
      }
      user.profilePicture = req.files.profilePicture[0].path;
    }

    if (req.files?.coverPicture && req.files.coverPicture.length > 0) {
      if (user.coverPicture) {
        await deleteCloudinaryByUrl(user.coverPicture);
      }
      user.coverPicture = req.files.coverPicture[0].path;
    }

    if (fullname) user.fullname = fullname;
    if (bio !== undefined) user.bio = bio;

    if (username && username !== user.username) {
      const exists = await User.findOne({ username });
      if (exists) return res.status(400).json({ message: "Username taken" });
      user.username = username;
    }

    await user.save();

    return res
      .status(200)
      .json({ message: "Profile updated", user: toSafeUser(user) });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getUserByIdHandler = async (req, res) => {
  try {
    const user = await User.findById(req.params.userID).select(
      "-password -otp -resetPasswordOTP -resetPasswordOTPExpires"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user: toSafeUser(user) });
  } catch (error) {
    console.error("Get User Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const findUserById = (userId) => User.findById(userId);

module.exports = {
  findUserById,
  getUserByIdHandler,
  updateProfile,
};
