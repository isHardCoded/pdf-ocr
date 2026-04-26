import path from "node:path";
import { fileURLToPath } from "node:url";

function defaultDataDir(): string {
  return path.join(fileURLToPath(new URL("../../..", import.meta.url)), "data");
}

const resolvedData =
  process.env.DATA_DIR != null && process.env.DATA_DIR.length > 0
    ? path.resolve(process.env.DATA_DIR)
    : defaultDataDir();

/** Prisma/PostgreSQL, e.g. postgresql://user:pass@localhost:5432/db?schema=public */
const defaultPg =
  "postgresql://postgres:postgres@127.0.0.1:5432/pdf_ocr?schema=public";

const dbUrl = (process.env.DATABASE_URL?.trim() || defaultPg).replace(/\r?\n/g, "");

const jwtSecret = (process.env.JWT_SECRET?.trim() || "dev-only-change-in-production").replace(/\r?\n/g, "");

function positiveInt(raw: string | undefined, fallback: number): number {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  dataDir: resolvedData,
  databaseUrl: dbUrl,
  port: Number(process.env.PORT) || 8000,
  jwtSecret,
  /** Access JWT (короткий TTL), httpOnly-cookie */
  accessTokenTtlSec: positiveInt(process.env.ACCESS_TOKEN_TTL_SEC, 900),
  /** Refresh (opaque), срок хранения в БД и cookie */
  refreshTokenTtlDays: positiveInt(process.env.REFRESH_TOKEN_TTL_DAYS, 30),
  accessTokenCookieName: (process.env.ACCESS_TOKEN_COOKIE_NAME?.trim() || "pdf_ocr_access").replace(/\r?\n/g, ""),
  refreshTokenCookieName: (process.env.REFRESH_TOKEN_COOKIE_NAME?.trim() || "pdf_ocr_refresh").replace(/\r?\n/g, ""),
} as const;

export function inputDir(): string {
  return path.join(env.dataDir, "input");
}

export function outputDir(): string {
  return path.join(env.dataDir, "output");
}
