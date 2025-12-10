const fs = require("fs");
const path = require("path");
const User = require("../models/user.model");

const deleteFileIfExists = (filePath) => {
  try {
    if (!filePath) return;
    const absPath = path.join(__dirname, "..", filePath);
    if (fs.existsSync(absPath)) fs.unlinkSync(absPath);
  } catch (err) {
    console.error("Failed to delete file", err);
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { fullname, bio, username } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // profile
    if (
      req.files &&
      req.files.profilePicture &&
      req.files.profilePicture.length > 0
    ) {
      // If using Cloudinary, store the URL
      user.profilePicture =
        req.files.profilePicture[0].path || req.files.profilePicture[0].url;
    }

    // cover
    if (
      req.files &&
      req.files.coverPicture &&
      req.files.coverPicture.length > 0
    ) {
      user.coverPicture =
        req.files.coverPicture[0].path || req.files.coverPicture[0].url;
    }

    if (fullname) user.fullname = fullname;
    if (bio) user.bio = bio;

    // username
    if (username && username !== user.username) {
      const exists = await User.findOne({ username });
      if (exists) return res.status(400).json({ message: "Username taken" });
      user.username = username;
    }

    await user.save();

    const safeUser = {
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
    };

    return res.status(200).json({ message: "Profile updated", user: safeUser });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getUserById = (userId) => {
  try {
    return User.findById(userId);
  } catch (error) {
    console.error("Get User Error:", error);
  }
};
const getUSerFollowers = (userId) => {
  try {
    return User.findById(userId).populate("followers");
  } catch (error) {
    console.error("Get User Followers Error:", error);
  }
};

const addProfilePictureToUser = (userId, profilePicturePath) => {
  return User.findByIdAndUpdate(
    userId,
    { profilePicture: profilePicturePath },
    { new: true }
  );
};

module.exports = {
  addProfilePictureToUser,
  getUserById,
  getUSerFollowers,
  updateProfile,
};
