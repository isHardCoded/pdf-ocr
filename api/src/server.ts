import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { resolve } from "node:path";
import { buildApp } from "./app.js";
import { env, inputDir, outputDir } from "./config/env.js";

async function main() {
  await mkdir(inputDir(), { recursive: true });
  await mkdir(outputDir(), { recursive: true });
  const app = await buildApp();
  const p = process.env.PORT
    ? z.coerce.number().int().min(1).max(65535).parse(process.env.PORT)
    : env.port;
  await app.listen({ port: p, host: "0.0.0.0" });
  app.log.info({ port: p, dataDir: env.dataDir, database: env.databaseUrl });
}

const here = fileURLToPath(import.meta.url);
const isMain = process.argv[1] && resolve(here) === resolve(process.argv[1]);
if (isMain) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
