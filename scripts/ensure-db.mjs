/**
 * Build-time guard: make sure a seeded database file exists before `next build`.
 *
 * On Vercel the filesystem is immutable at runtime, so the only chance to write
 * the SQLite file is during the build. Next traces `db/*.db` into the server
 * bundle (see outputFileTracingIncludes in next.config.ts), which is what makes
 * the storefront work at all on a serverless deploy.
 *
 * Locally this is a no-op once `npm run db:seed` has been run, so a dev machine
 * with customised data is never silently wiped by a build.
 *
 * Run: node scripts/ensure-db.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const DB_PATH = path.resolve(process.cwd(), process.env.DATABASE_PATH || "db/super-z-shop.db");

if (fs.existsSync(DB_PATH) && fs.statSync(DB_PATH).size > 0) {
  console.log(`database present: ${path.relative(process.cwd(), DB_PATH)}`);
  process.exit(0);
}

console.log(`no database at ${path.relative(process.cwd(), DB_PATH)} — creating and seeding it`);
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const res = spawnSync(process.execPath, ["scripts/seed.mjs"], {
  stdio: "inherit",
  env: { ...process.env, DATABASE_PATH: DB_PATH },
});
process.exit(res.status ?? 1);
