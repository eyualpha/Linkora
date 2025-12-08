const { EMAIL_USER } = require("../configs/env.config");
const { emailTemplate } = require("./emailTemplate");
const transporter = require("../configs/nodemailer.config");

const sendOTP = async (email, subject, text) => {
  try {
    const mailOptions = {
      from: `Linkora Support <${EMAIL_USER}>`,
      to: email,
      subject,
      html: emailTemplate(subject, text),
    };

    transporter.verify((err, success) => {
      if (err) {
        console.error("SMTP Error:", err);
      } else {
        console.log("SMTP Ready!");
      }
    });

    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}`);

    return true;
  } catch (error) {
    console.error("Email Sending Error:", error.message || error);
    return false;
  }
};

module.exports = sendOTP;
