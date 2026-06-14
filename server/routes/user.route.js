const express = require("express");
const { isAuthenticated } = require("../middlewares/auth.middleware");
const {
  updateProfile,
  getUserByIdHandler,
  searchUsers,
} = require("../controllers/user.controller");
const upload = require("../middlewares/upload");

const userRouter = express.Router();

const uploadFields = upload.fields([
  { name: "profilePicture", maxCount: 1 },
  { name: "coverPicture", maxCount: 1 },
]);

userRouter.put("/update-profile", isAuthenticated, uploadFields, updateProfile);
userRouter.get("/search", isAuthenticated, searchUsers);
userRouter.get("/:userID", getUserByIdHandler);

module.exports = userRouter;
