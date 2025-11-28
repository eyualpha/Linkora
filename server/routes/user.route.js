const express = require("express");
const { register, login } = require("../controllers/auth.controller");
const multer = require("multer");
const userRouter = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

userRouter.post("/profile-picture", upload.single("profilePicture"), register);

userRouter.get("/");

module.exports = userRouter;
