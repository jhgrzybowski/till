import * as SQLite from "expo-sqlite";

import { runMigrations } from "./migrations";
import { seedDefaultCategories } from "./seed";
import { DATABASE_NAME } from "./schema";

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;
let initializedPromise: Promise<void> | null = null;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  databasePromise ??= SQLite.openDatabaseAsync(DATABASE_NAME);
  return databasePromise;
}

export function initializeDatabase(): Promise<void> {
  initializedPromise ??= (async () => {
    const db = await getDatabase();
    await runMigrations(db);
    await seedDefaultCategories(db);
  })();

  return initializedPromise;
}
