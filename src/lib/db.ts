/**
 * SQLite connection + migration runner.
 *
 * Uses Node's built-in `node:sqlite` (Node >= 22.5) so the demo needs no native
 * build step and no paid database service. Swapping to Prisma/Postgres later
 * means replacing this module and `src/lib/repo.ts` only.
 */
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const DB_PATH = path.resolve(
  process.cwd(),
  process.env.DATABASE_PATH || "db/super-z-shop.db",
);

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
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
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
