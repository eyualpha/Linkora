const transporter = require("../configs/nodemailer.config");

const sendOTP = async (email, otp) => {
  console.log(`OTP for ${email}: ${otp}`);

  const mailOptions = {
    from: '"Linkora Support" <' + process.env.EMAIL_USER + ">",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${otp}. It is valid for 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);

  return true;
};
module.exports = sendOTP;
