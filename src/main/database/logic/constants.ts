export const DATABASE_FILE_NAME = 'app.db';

/**
 * Applied to every connection, in this order, before any query runs.
 *
 * These are per-connection settings, not stored in the file, so a fresh connection
 * that forgets them silently loses the guarantees - which is why they live here and
 * are applied by `DatabaseService.connect()` rather than being sprinkled around.
 */
export const DATABASE_PRAGMAS = [
  /**
   * Write-Ahead Logging: readers no longer block on a writer, and a crash mid-write
   * can be recovered. The sane default for a desktop app. Costs two sidecar files
   * next to the .db (`-wal` and `-shm`).
   */
  'PRAGMA journal_mode = WAL',
  /**
   * SQLite ships with foreign keys DISABLED for backwards compatibility, per connection.
   * Without this line `REFERENCES` is decorative and `ON DELETE SET NULL` never fires.
   */
  'PRAGMA foreign_keys = ON',
  /** Wait up to 5s for a lock instead of throwing SQLITE_BUSY immediately. */
  'PRAGMA busy_timeout = 5000',
  /** With WAL, NORMAL is durable against app crashes and much faster than FULL. */
  'PRAGMA synchronous = NORMAL',
] as const;

/**
 * SQLite has no date type. We store ISO-8601 UTC strings because they sort
 * lexicographically, are human-readable in a DB browser, and map straight onto
 * `new Date(value)` in the renderer.
 */
export const SQL_NOW = "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";
