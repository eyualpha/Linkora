const nodemailer = require("nodemailer");
const { EMAIL_USER, EMAIL_PASSWORD } = require("./env.config");

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});
module.exports = transporter;
