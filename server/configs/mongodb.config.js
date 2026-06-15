const mongoose = require("mongoose");
const dns = require("dns");
const { MONGO_URI } = require("./env.config.js");

dns.setDefaultResultOrder("ipv4first");

const PUBLIC_DNS = ["8.8.8.8", "8.8.4.4", "1.1.1.1"];
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;

let cachedPromise;
let resolvedUri;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const formatMongoError = (error) => {
  const message = error?.message || "Unknown MongoDB error";

  if (/querySrv ECONNREFUSED|ENOTFOUND _mongodb\._tcp/i.test(message)) {
    return [
      "MongoDB DNS lookup failed on this network (common on Windows/VPN/campus Wi‑Fi).",
      "Fix: restart the server after this update, or set MONGO_URI_STANDARD in server/.env",
      "using Atlas -> Connect -> Drivers -> \"Standard connection string\".",
      "Also ensure your IP is whitelisted in Atlas -> Network Access.",
    ].join(" ");
  }

  if (/whitelist|IP that isn't whitelisted/i.test(message)) {
    return [
      "MongoDB Atlas rejected the connection (IP not whitelisted).",
      "Fix: Atlas -> Network Access -> Add IP Address.",
      "Use your current public IP, or 0.0.0.0/0 for local development.",
      "If you use a VPN, whitelist the VPN exit IP or disconnect the VPN.",
    ].join(" ");
  }

  if (/Server selection timed out|ReplicaSetNoPrimary/i.test(message)) {
    return [
      "MongoDB Atlas is unreachable from this network.",
      "Common causes: IP not whitelisted, VPN/firewall blocking port 27017, or cluster paused.",
      "Check Atlas -> Network Access and Database cluster status.",
    ].join(" ");
  }

  if (/bad auth|Authentication failed/i.test(message)) {
    return [
      "MongoDB authentication failed.",
      "Verify MONGO_URI username/password in Atlas -> Database Access.",
    ].join(" ");
  }

  return message;
};

async function resolveSrvWithPublicDns(hostname) {
  const resolver = new dns.promises.Resolver();
  resolver.setServers(PUBLIC_DNS);

  const [srvRecords, txtRecords] = await Promise.all([
    resolver.resolveSrv(`_mongodb._tcp.${hostname}`),
    resolver.resolveTxt(`_mongodb._tcp.${hostname}`).catch(() => []),
  ]);

  return { srvRecords, txtRecords };
}

async function convertSrvToStandardUri(srvUri) {
  const url = new URL(srvUri);
  const { srvRecords, txtRecords } = await resolveSrvWithPublicDns(url.hostname);

  const hosts = srvRecords
    .sort((a, b) => a.priority - b.priority)
    .map((record) => `${record.name}:${record.port}`)
    .join(",");

  const params = new URLSearchParams(url.searchParams);

  for (const txt of txtRecords) {
    const options = Array.isArray(txt) ? txt.join("") : String(txt);
    for (const part of options.split("&")) {
      const [key, value] = part.split("=");
      if (key && value && !params.has(key)) {
        params.set(key, value);
      }
    }
  }

  if (!params.has("ssl") && !params.has("tls")) {
    params.set("ssl", "true");
  }

  const dbName = url.pathname.replace(/^\//, "") || "linkora";
  const auth =
    url.username && url.password
      ? `${encodeURIComponent(url.username)}:${encodeURIComponent(url.password)}@`
      : url.username
        ? `${encodeURIComponent(url.username)}@`
        : "";

  return `mongodb://${auth}${hosts}/${dbName}?${params.toString()}`;
}

async function resolveConnectionUri() {
  const standardOverride = process.env.MONGO_URI_STANDARD?.trim();
  if (standardOverride) {
    console.log("Using MONGO_URI_STANDARD for MongoDB connection.");
    return standardOverride;
  }

  if (!MONGO_URI?.startsWith("mongodb+srv://")) {
    return MONGO_URI;
  }

  try {
    const standardUri = await convertSrvToStandardUri(MONGO_URI);
    console.log("Resolved MongoDB SRV via public DNS for local connection.");
    return standardUri;
  } catch (error) {
    console.warn(
      "MongoDB SRV pre-resolution failed; using mongodb+srv URI:",
      error.message
    );
    return MONGO_URI;
  }
}

async function attemptConnect(uri) {
  return mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    family: 4,
    maxPoolSize: 10,
  });
}

const connectDB = async () => {
  if (!MONGO_URI) {
    throw new Error(
      "MONGO_URI is not set; add it to your environment variables."
    );
  }

  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (cachedPromise) return cachedPromise;

  cachedPromise = (async () => {
    if (!resolvedUri) {
      resolvedUri = await resolveConnectionUri();
    }

    let uri = resolvedUri;
    let lastError;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        await attemptConnect(uri);
        console.log(`MongoDB connected (${mongoose.connection.name})`);
        return mongoose.connection;
      } catch (error) {
        lastError = error;

        const isSrvDnsError = /querySrv ECONNREFUSED|ENOTFOUND _mongodb\._tcp/i.test(
          error.message
        );

        if (
          isSrvDnsError &&
          uri.startsWith("mongodb+srv://") &&
          !process.env.MONGO_URI_STANDARD?.trim()
        ) {
          try {
            uri = await convertSrvToStandardUri(MONGO_URI);
            resolvedUri = uri;
            console.log("Retrying MongoDB with standard connection string...");
            continue;
          } catch (resolveError) {
            lastError = resolveError;
          }
        }

        if (attempt < MAX_ATTEMPTS) {
          console.warn(
            `MongoDB connect attempt ${attempt}/${MAX_ATTEMPTS} failed; retrying...`
          );
          await sleep(RETRY_DELAY_MS * attempt);
        }
      }
    }

    const helpful = formatMongoError(lastError);
    console.error("MongoDB connection failed:", helpful);
    throw new Error(helpful);
  })();

  try {
    return await cachedPromise;
  } catch (error) {
    cachedPromise = null;
    throw error;
  }
};

module.exports = connectDB;
