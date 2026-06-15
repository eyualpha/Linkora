require("dotenv").config();

const normalizeEmailPass = (pass) => (pass || "").replace(/\s/g, "");

const DEFAULT_DB_NAME = "linkora";

const normalizeMongoUri = (uri) => {
  if (!uri) return uri;

  const trimmed = uri.trim();
  if (!trimmed.startsWith("mongodb")) return trimmed;

  try {
    const parsed = new URL(trimmed);
    const pathname = parsed.pathname.replace(/^\//, "");

    if (!pathname || pathname === "") {
      parsed.pathname = `/${DEFAULT_DB_NAME}`;
    }

    if (!parsed.searchParams.has("retryWrites")) {
      parsed.searchParams.set("retryWrites", "true");
    }
    if (!parsed.searchParams.has("w")) {
      parsed.searchParams.set("w", "majority");
    }

    return parsed.toString();
  } catch {
    return trimmed;
  }
};

const config = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: normalizeMongoUri(process.env.MONGO_URI),
  EMAIL_USER: process.env.EMAIL_USER?.trim(),
  EMAIL_PASS: normalizeEmailPass(process.env.EMAIL_PASS),
  EMAIL_FROM: process.env.EMAIL_FROM?.trim() || process.env.EMAIL_USER?.trim(),
  SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
  SMTP_PORT: Number(process.env.SMTP_PORT || 465),
  SMTP_SECURE: process.env.SMTP_SECURE !== "false",
  RESEND_API_KEY: process.env.RESEND_API_KEY?.trim(),
  RESEND_FROM: process.env.RESEND_FROM?.trim(),
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  OTP_EXPIRY_MS: 10 * 60 * 1000,
  BCRYPT_SALT_ROUNDS: 10,
  STORY_TTL_MS: 24 * 60 * 60 * 1000,
  MAX_STORIES_PER_USER: 10,
  DEV_LOG_OTP:
    process.env.NODE_ENV !== "production" &&
    process.env.DEV_LOG_OTP === "true",
};

const validateEnv = () => {
  const required = ["MONGO_URI", "JWT_SECRET"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
};

const validateEmailConfig = () => {
  if (config.RESEND_API_KEY) {
    console.log("Email provider: Resend (recommended for reliable delivery).");
    return true;
  }

  if (config.EMAIL_USER && config.EMAIL_PASS) {
    console.log(
      "Email provider: SMTP (Gmail/Workspace). External delivery may be filtered — consider RESEND_API_KEY."
    );
    return true;
  }

  console.warn(
    "Warning: No email provider configured. Set RESEND_API_KEY or EMAIL_USER + EMAIL_PASS."
  );
  return false;
};

module.exports = { ...config, validateEnv, validateEmailConfig, normalizeMongoUri };
