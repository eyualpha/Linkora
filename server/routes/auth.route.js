const express = require("express");
const { register, login } = require("../controllers/auth.controller");
const { verifyOTP } = require("../controllers/verifyOTP.controller");
const authRouter = express.Router();

authRouter.post("/register", register);

authRouter.post("/login", login);

authRouter.post("/verify-otp", verifyOTP);

module.exports = authRouter;
