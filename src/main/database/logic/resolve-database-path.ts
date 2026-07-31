import { join } from 'node:path';
import { app } from 'electron';
import { DATABASE_FILE_NAME } from './constants';

/**
 * `userData` is the per-user, per-app directory Electron guarantees is writable
 * (`~/Library/Application Support/<app>` on macOS, `%APPDATA%\<app>` on Windows).
 *
 * Never put the database next to the executable: on macOS and Windows that path is
 * read-only once the app is packaged, and it would be wiped on every update.
 */
export function resolveDatabasePath(): string {
  return join(app.getPath('userData'), DATABASE_FILE_NAME);
}
