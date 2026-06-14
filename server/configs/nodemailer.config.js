const nodemailer = require("nodemailer");
const { EMAIL_USER, EMAIL_PASS } = require("./env.config");

const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true, // REQUIRED for port 465
  port: 465,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== "false",
  },
});

module.exports = transporter;
