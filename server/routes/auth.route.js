const express = require("express");
const {
  register,
  login,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");
const {
  verifyRegistrationOTP,
  verifyResetOTP,
  resendRegistrationOTP,
} = require("../controllers/verifyOTP.controller");

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/verify-otp", verifyRegistrationOTP);
authRouter.post("/resend-otp", resendRegistrationOTP);

authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/verify-reset-otp", verifyResetOTP);
authRouter.post("/reset-password", resetPassword);

module.exports = authRouter;
