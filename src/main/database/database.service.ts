import { DatabaseSync } from 'node:sqlite';
import { DATABASE_PRAGMAS } from './logic/constants';
import { resolveDatabasePath } from './logic/resolve-database-path';
import { runMigrations } from './migrations';

/**
 * Owns the one and only SQLite connection for the whole app.
 *
 * Why `node:sqlite` and not better-sqlite3: it is built into the Node that Electron
 * ships, so there is no native module to rebuild per Electron version, no
 * `electron-builder install-app-deps` dance, and nothing to unpack from the asar.
 *
 * Why a single connection: the API is synchronous and the main process is
 * single-threaded, so queries can never interleave. One connection also means the
 * PRAGMAs below are guaranteed to apply to every query in the app.
 *
 * Why the main process: `node:sqlite` needs Node APIs, and reaching the filesystem
 * from the renderer would mean disabling context isolation. The renderer talks to
 * this layer only over IPC.
 */
export class DatabaseService {
  private database: DatabaseSync | null = null;

  /** Opens the file (creating it on first run), applies PRAGMAs, then migrates. */
  connect(): DatabaseSync {
    if (this.database) return this.database;

    const database = new DatabaseSync(resolveDatabasePath());

    for (const pragma of DATABASE_PRAGMAS) database.exec(pragma);

    this.database = database;

    runMigrations(database);

    return database;
  }

  getConnection(): DatabaseSync {
    if (!this.database) throw new Error('DatabaseService.connect() must run before the database is used.');

    return this.database;
  }

  /**
   * Runs `work` inside a transaction: all of its writes land together, or none do.
   *
   * `node:sqlite` has no transaction helper of its own, so this wraps the
   * BEGIN/COMMIT/ROLLBACK trio and guarantees the ROLLBACK on any thrown error.
   * Because the driver is synchronous, `work` must be synchronous too - an `await`
   * inside would let unrelated statements slip into the open transaction.
   */
  transaction<T>(work: () => T): T {
    const database = this.getConnection();

    database.exec('BEGIN');

    try {
      const result = work();

      database.exec('COMMIT');

      return result;
    } catch (error) {
      database.exec('ROLLBACK');

      throw error;
    }
  }

  /**
   * Closing checkpoints the WAL back into the main file. Skipping it on quit leaves
   * `-wal`/`-shm` sidecars behind that the next launch has to recover.
   */
  close(): void {
    if (!this.database) return;

    this.database.close();

    this.database = null;
  }
}
