import type { DatabaseSync, SQLInputValue } from 'node:sqlite';

/**
 * Named bind values, keyed without the `:` prefix (`node:sqlite` accepts bare names).
 *
 * `SQLInputValue` deliberately excludes booleans and `undefined` - run those through
 * `toSqliteValue` first, so the conversion is explicit at the call site.
 */
export type QueryParameters = Record<string, SQLInputValue>;

export type Migration = {
  /**
   * Sequential, starting at 1. Stored in the file via `PRAGMA user_version`.
   *
   * Once a version has shipped it is frozen - fixing a mistake means adding a new
   * migration, never editing an old one, or installed apps will never re-run it.
   */
  version: number;
  name: string;
  up: (database: DatabaseSync) => void;
};
