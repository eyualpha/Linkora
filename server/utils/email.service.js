const {
  EMAIL_FROM,
  EMAIL_USER,
  RESEND_API_KEY,
  RESEND_FROM,
} = require("../configs/env.config");
const { createTransporter } = require("../configs/nodemailer.config");

const sendViaResend = async ({ to, subject, text, html }) => {
  const { Resend } = require("resend");
  const resend = new Resend(RESEND_API_KEY);

  const from = RESEND_FROM || "Linkora <onboarding@resend.dev>";

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject,
    text,
    html,
  });

  if (error) {
    throw new Error(error.message || "Resend failed to send email");
  }

  return { provider: "resend", messageId: data?.id };
};

const sendViaSmtp = async ({ to, subject, text, html }) => {
  const fromAddress = EMAIL_FROM || EMAIL_USER;

  if (!fromAddress) {
    throw new Error("EMAIL_USER / EMAIL_FROM is not configured for SMTP.");
  }

  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: { name: "Linkora", address: fromAddress },
    to,
    replyTo: fromAddress,
    subject,
    text,
    html,
  });

  if (info.rejected?.length) {
    throw new Error(`SMTP rejected: ${info.rejected.join(", ")}`);
  }

  return {
    provider: "smtp",
    messageId: info.messageId,
    accepted: info.accepted,
  };
};

const sendEmail = async ({ to, subject, text, html }) => {
  if (RESEND_API_KEY) {
    return sendViaResend({ to, subject, text, html });
  }
  return sendViaSmtp({ to, subject, text, html });
};

module.exports = { sendEmail, sendViaResend, sendViaSmtp };
