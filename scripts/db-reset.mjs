/** Deletes the local SQLite file and re-runs migrations + seed. */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const DB_PATH = path.resolve(process.cwd(), process.env.DATABASE_PATH || "db/super-z-shop.db");
for (const suffix of ["", "-wal", "-shm"]) {
  const f = DB_PATH + suffix;
  if (fs.existsSync(f)) {
    fs.rmSync(f);
    console.log(`removed ${path.basename(f)}`);
  }
}
const res = spawnSync(process.execPath, ["scripts/seed.mjs"], { stdio: "inherit" });
process.exit(res.status ?? 1);
