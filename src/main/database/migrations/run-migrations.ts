import { migrations } from './migrations';
import type { DatabaseSync } from 'node:sqlite';

/**
 * Brings the file up to the latest schema version, then returns that version.
 *
 * SQLite stores a free integer for us in the file header (`PRAGMA user_version`), so a
 * migration table is unnecessary: the version travels with the .db file itself.
 *
 * Each migration runs inside its own transaction, so a failure halfway through leaves
 * the file exactly as it was - SQLite supports transactional DDL, unlike MySQL.
 */
export function runMigrations(database: DatabaseSync): number {
  const currentVersion = readSchemaVersion(database);

  const pendingMigrations = migrations
    .filter((migration) => migration.version > currentVersion)
    .sort((a, b) => a.version - b.version);

  for (const migration of pendingMigrations) {
    database.exec('BEGIN');

    try {
      migration.up(database);

      // PRAGMA values cannot be bound, so this is built from a number we control.
      database.exec(`PRAGMA user_version = ${migration.version}`);

      database.exec('COMMIT');
    } catch (error) {
      database.exec('ROLLBACK');

      throw new Error(`Migration ${migration.version} (${migration.name}) failed: ${String(error)}`);
    }
  }

  return readSchemaVersion(database);
}

function readSchemaVersion(database: DatabaseSync): number {
  const row = database.prepare('PRAGMA user_version').get() as { user_version: number } | undefined;

  return row?.user_version ?? 0;
}
