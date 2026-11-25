import Database from "@tauri-apps/plugin-sql";
import { isTauriRuntime } from "@/lib/tauri/env";

const DB_CONNECTION = "sqlite:algojava.db";

let dbPromise: Promise<Database> | null = null;

export function getDatabase(): Promise<Database> {
  if (!isTauriRuntime()) {
    return Promise.reject(
      new Error(
        "Local SQLite storage requires the AlgoJava desktop runtime (launch via `bun run tauri dev`)."
      )
    );
  }

  if (!dbPromise) {
    dbPromise = Database.load(DB_CONNECTION)
      .then(async (db) => {
        await db.execute("PRAGMA foreign_keys = ON;");
        return db;
      })
      .catch((err) => {
        dbPromise = null;
        throw err;
      });
  }

  return dbPromise;
}
