import type { SQLiteDatabase } from "expo-sqlite";

import { CREATE_SCHEMA_SQL, DATABASE_VERSION } from "./schema";

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  await db.execAsync("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;");

  const result = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentVersion === 0) {
    await db.execAsync(CREATE_SCHEMA_SQL);
  }

  if (currentVersion > 0 && currentVersion < 2) {
    await db.execAsync("ALTER TABLE user_settings ADD COLUMN display_name TEXT NOT NULL DEFAULT 'Ty';");
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
