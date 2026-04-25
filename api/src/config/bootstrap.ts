import { env } from "./env.js";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = env.databaseUrl;
}
