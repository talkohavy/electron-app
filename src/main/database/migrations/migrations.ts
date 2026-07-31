import { SQL_NOW } from '../logic/constants';
import type { Migration } from '../types';

/**
 * The schema, expressed as an append-only list.
 *
 * To evolve the schema: append `{ version: <next>, ... }`. Never edit or reorder an
 * entry that has already shipped - existing installs are already past that version
 * and will skip it.
 */
export const migrations: Array<Migration> = [
  {
    version: 1,
    name: 'create-categories-and-tasks',
    up: (database) => {
      database.exec(`
        CREATE TABLE categories (
          id    INTEGER PRIMARY KEY AUTOINCREMENT,
          name  TEXT NOT NULL UNIQUE,
          color TEXT NOT NULL
        )
      `);

      /**
       * CHECK constraints keep the invariants next to the data, so a bug in the service
       * layer still cannot write a blank title or an unknown priority. The database is
       * the last line of defence, not the only one.
       */
      database.exec(`
        CREATE TABLE tasks (
          id          INTEGER PRIMARY KEY AUTOINCREMENT,
          title       TEXT    NOT NULL CHECK (length(trim(title)) > 0),
          notes       TEXT    NOT NULL DEFAULT '',
          is_done     INTEGER NOT NULL DEFAULT 0 CHECK (is_done IN (0, 1)),
          priority    TEXT    NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
          category_id INTEGER REFERENCES categories (id) ON DELETE SET NULL,
          created_at  TEXT    NOT NULL DEFAULT (${SQL_NOW}),
          updated_at  TEXT    NOT NULL DEFAULT (${SQL_NOW})
        )
      `);

      // Indexes for the columns the list query filters and sorts on.
      database.exec('CREATE INDEX idx_tasks_is_done ON tasks (is_done)');
      database.exec('CREATE INDEX idx_tasks_category_id ON tasks (category_id)');
      database.exec('CREATE INDEX idx_tasks_created_at ON tasks (created_at DESC)');
    },
  },
  {
    version: 2,
    name: 'seed-default-categories',
    up: (database) => {
      const insertCategory = database.prepare('INSERT OR IGNORE INTO categories (name, color) VALUES (?, ?)');

      const defaultCategories: Array<[string, string]> = [
        ['Work', '#6366f1'],
        ['Personal', '#10b981'],
        ['Errands', '#f59e0b'],
        ['Ideas', '#ec4899'],
      ];

      // One prepared statement, executed many times - compile once, bind often.
      for (const [name, color] of defaultCategories) insertCategory.run(name, color);
    },
  },
];
