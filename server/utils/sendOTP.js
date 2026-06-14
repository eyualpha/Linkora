const { EMAIL_USER } = require("../configs/env.config");
const { emailTemplate } = require("./emailTemplate");
const transporter = require("../configs/nodemailer.config");

const sendOTP = async (email, subject, text) => {
  const mailOptions = {
    from: `Linkora Support <${EMAIL_USER}>`,
    to: email,
    subject,
    html: emailTemplate(subject, text),
  };

  await transporter.sendMail(mailOptions);
  console.log(`OTP email sent to ${email}`);
};

module.exports = sendOTP;
