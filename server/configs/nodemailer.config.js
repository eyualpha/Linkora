const nodemailer = require("nodemailer");
const {
  EMAIL_USER,
  EMAIL_PASS,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
} = require("./env.config");

let transporter;

const createTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    tls: {
      minVersion: "TLSv1.2",
      rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== "false",
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  return transporter;
};

const verifyEmailConnection = async () => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    return { ok: false, error: "EMAIL_USER or EMAIL_PASS not configured" };
  }

  try {
    const transport = createTransporter();
    await transport.verify();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error.message || "SMTP verification failed",
    };
  }
};

module.exports = { createTransporter, verifyEmailConnection };
