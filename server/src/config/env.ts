import fs from "node:fs";
import path from "node:path";

import dotenv from "dotenv";

const envCandidates = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "..", "..", "..", "server", ".env"),
];

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

function readRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function readPortEnv(name: string, fallback: number) {
  const rawValue = process.env[name]?.trim();

  if (!rawValue) {
    return fallback;
  }

  const parsedValue = Number(rawValue);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`Invalid port value for ${name}: ${rawValue}`);
  }

  return parsedValue;
}

function readClientOrigins() {
  const rawOrigins = process.env.CLIENT_ORIGIN?.trim() || "http://localhost:5173";

  return rawOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const env = {
  port: readPortEnv("PORT", 5000),
  clientOrigins: readClientOrigins(),
  databaseUrl: readRequiredEnv("DATABASE_URL"),
  jwtSecret: readRequiredEnv("JWT_SECRET"),
};
