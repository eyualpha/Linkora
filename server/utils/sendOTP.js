const transporter = require("../configs/nodemailer.config");
const { EMAIL_USER } = require("../configs/env.config");

const sendOTP = async (email, subject, text) => {
  const mailOptions = {
    from: '"Linkora Support" <' + EMAIL_USER + ">",
    to: email,
    subject: subject,
    text: text,
  };

  await transporter.sendMail(mailOptions);
  console.log(`OTP email sent to ${email}`);

  return true;
};
module.exports = sendOTP;
