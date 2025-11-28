const express = require("express");
const { register, login } = require("../controllers/auth.controller");
const multer = require("multer");
const authRouter = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

authRouter.post("/register", upload.single("profilePicture"), register);

authRouter.post("/login", login);

module.exports = authRouter;
