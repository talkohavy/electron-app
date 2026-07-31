import type { SQLInputValue } from 'node:sqlite';

/**
 * SQLite can only bind null, number, bigint, string and ArrayBufferViews.
 *
 * Passing a boolean or `undefined` throws "Provided value cannot be bound to SQLite
 * parameter", so booleans are narrowed to the 0/1 integers SQLite uses for truthiness.
 */
export function toSqliteValue(value: unknown): SQLInputValue {
  if (typeof value === 'boolean') return value ? 1 : 0;

  if (value === undefined) return null;

  return value as SQLInputValue;
}
