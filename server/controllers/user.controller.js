const User = require("../models/user.model");

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
};
