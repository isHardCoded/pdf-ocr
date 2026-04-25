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

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  dataDir: resolvedData,
  databaseUrl: dbUrl,
  port: Number(process.env.PORT) || 8000,
} as const;

export function inputDir(): string {
  return path.join(env.dataDir, "input");
}

export function outputDir(): string {
  return path.join(env.dataDir, "output");
}
