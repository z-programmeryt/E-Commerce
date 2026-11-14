/**
 * SQLite connection + migration runner.
 *
 * Uses Node's built-in `node:sqlite` (Node >= 22.5) so the demo needs no native
 * build step and no paid database service. Swapping to Prisma/Postgres later
 * means replacing this module and `src/lib/repo.ts` only.
 *
 * Deployment note — serverless filesystems are read-only.
 *
 * On Vercel the deployment bundle is immutable at runtime: only `os.tmpdir()`
 * accepts writes. The database file is therefore created and seeded at *build*
 * time (`npm run db:seed` runs as part of `npm run build`) and traced into the
 * bundle. At runtime `fs.copyFileSync` is the one call that is guaranteed to
 * work, so the seeded file is copied into a writable directory once per warm
 * instance. Reads work as-is; writes then land in that instance's copy.
 *
 * The consequence is honest and documented: in a serverless deployment each
 * instance has its own copy, so an order placed on one instance is not visible
 * on another. A shop taking real orders needs a real database — see
 * docs/KNOWN-LIMITATIONS.md.
 */
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const SEEDED_PATH = path.resolve(
  process.cwd(),
  process.env.DATABASE_PATH || "db/super-z-shop.db",
);

/**
 * A read-only filesystem (Vercel, most container platforms) cannot open the
 * bundled file for writing, so it is copied into a temp directory first.
 * `DB_PATH` always names the file the process actually uses.
 */
function resolveWritableDbPath(): string {
  const target = process.env.DATABASE_WRITABLE_PATH
    ? path.resolve(process.env.DATABASE_WRITABLE_PATH)
    : path.join(os.tmpdir(), "super-z-shop", "super-z-shop.db");

  // Local dev and `next start` on a real disk: keep the file where it is, so
  // `npm run db:reset` and the admin actions operate on the same database.
  if (!process.env.VERCEL && !process.env.DATABASE_WRITABLE_PATH) return SEEDED_PATH;

  try {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    if (!fs.existsSync(target) && fs.existsSync(SEEDED_PATH)) {
      fs.copyFileSync(SEEDED_PATH, target);
      // copyFileSync copies the source's mode, and the bundled file is read-only.
      // SQLite cannot even switch on WAL for a read-only file, so claim the copy.
      fs.chmodSync(target, 0o644);
    }
    return target;
  } catch {
    // Copy failed (no bundle, no permission): fall back to the bundled path and
    // let the normal error surface if it is genuinely unusable.
    return SEEDED_PATH;
  }
}

const DB_PATH = resolveWritableDbPath();

let cached: DatabaseSync | null = null;

export function dbPath(): string {
  return DB_PATH;
}

export function applyMigrations(database: DatabaseSync): string[] {
  const dir = path.resolve(process.cwd(), "db/migrations");
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  database.exec(
    "CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (datetime('now')))",
  );
  const applied: string[] = [];
  for (const file of files) {
    const exists = database
      .prepare("SELECT 1 FROM _migrations WHERE name = ?")
      .get(file);
    if (exists) continue;
    const sql = fs.readFileSync(path.join(dir, file), "utf8");
    database.exec(sql);
    database.prepare("INSERT INTO _migrations (name) VALUES (?)").run(file);
    applied.push(file);
  }
  return applied;
}

/**
 * Returns the singleton database handle, creating and migrating the file on
 * first use. Next.js dev server reuses the module across HMR reloads.
 */
export function getDb(): DatabaseSync {
  if (cached) return cached;
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  } catch {
    // read-only filesystem and the directory already exists — nothing to do
  }
  const database = new DatabaseSync(DB_PATH);
  database.exec("PRAGMA journal_mode = WAL");
  database.exec("PRAGMA foreign_keys = ON");
  database.exec("PRAGMA busy_timeout = 5000");
  applyMigrations(database);
  cached = database;
  return database;
}

export function resetDb(): void {
  for (const suffix of ["", "-wal", "-shm"]) {
    const f = DB_PATH + suffix;
    if (fs.existsSync(f)) fs.rmSync(f);
  }
  cached = null;
}

/**
 * node:sqlite returns null-prototype objects, which React refuses to serialise
 * across the server/client boundary. Every row is copied into a plain object.
 */
function plain<T>(row: unknown): T {
  return row ? ({ ...(row as Record<string, unknown>) } as T) : (row as T);
}

/** Convenience helpers with sane rows typing. */
export function all<T>(sql: string, params: unknown[] = []): T[] {
  return getDb().prepare(sql).all(...(params as never[])).map((r) => plain<T>(r));
}

export function one<T>(sql: string, params: unknown[] = []): T | undefined {
  return plain<T>(getDb().prepare(sql).get(...(params as never[])));
}

export function run(sql: string, params: unknown[] = []) {
  return getDb().prepare(sql).run(...(params as never[]));
}

export function transaction<T>(fn: () => T): T {
  const database = getDb();
  database.exec("BEGIN IMMEDIATE");
  try {
    const result = fn();
    database.exec("COMMIT");
    return result;
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}
