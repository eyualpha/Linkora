const { DEV_LOG_OTP } = require("../configs/env.config");
const { sendEmail } = require("./email.service");
const { emailTemplate, emailTextTemplate } = require("./emailTemplate");

const sendOTP = async (email, subject, otp) => {
  if (DEV_LOG_OTP) {
    console.log(`[DEV_LOG_OTP] OTP for ${email}: ${otp}`);
  }

  const text = emailTextTemplate(subject, otp);
  const html = emailTemplate(subject, otp);

  const result = await sendEmail({ to: email, subject, text, html });

  console.log(
    `OTP email sent via ${result.provider} — to: ${email}, messageId: ${result.messageId}`
  );

  return result;
};

module.exports = sendOTP;
