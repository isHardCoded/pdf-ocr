import { config } from "dotenv";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Каталог `api/`: в dev — `src/config`, в prod — `dist/config`
const _here = dirname(fileURLToPath(import.meta.url));
const _apiDir = resolve(_here, "../..");
const _repoRoot = resolve(_apiDir, "..");

if (existsSync(resolve(_repoRoot, ".env"))) {
  config({ path: resolve(_repoRoot, ".env") });
}
config({ path: resolve(_apiDir, ".env"), override: true });
