import { BaseRepository, SQL_NOW, toSqliteValue } from '@main/database';
import { TaskPriorities } from '@root/common/constants';
import { DEFAULT_TASK_QUERY, ORDER_BY_CLAUSES, UPDATABLE_COLUMNS } from '../logic/constants';
import { mapTaskRow } from '../logic/map-task-row';
import type { QueryParameters } from '@main/database';
import type { CreateTaskInput, Task, TaskCategory, TaskQuery, TaskStats, UpdateTaskInput } from '@root/common/types';
import type { TaskRow, TaskStatsRow } from '../types';

/**
 * Every read goes through this projection, so a task is always shaped identically and
 * the category is always resolved.
 *
 * LEFT JOIN (not INNER) because `category_id` is nullable - an inner join would silently
 * hide uncategorised tasks, one of the classic SQL bugs.
 */
const SELECT_TASK = `
  SELECT
    t.id,
    t.title,
    t.notes,
    t.is_done,
    t.priority,
    t.category_id,
    c.name  AS category_name,
    c.color AS category_color,
    t.created_at,
    t.updated_at
  FROM tasks t
  LEFT JOIN categories c ON c.id = t.category_id
`;

export class TasksRepository extends BaseRepository {
  findAll(query: TaskQuery = {}): Array<Task> {
    const { search, status, sortBy } = { ...DEFAULT_TASK_QUERY, ...query };

    /**
     * One statement covers every filter combination: each `WHERE` clause short-circuits
     * when its filter is inactive. That keeps the SQL constant, so the prepared-statement
     * cache stays effective instead of compiling a new statement per filter combination.
     *
     * `ORDER BY` is the only interpolated part, and it comes from a hard-coded lookup -
     * never from the payload. Values are always bound.
     */
    const rows = this.queryAll<TaskRow>(
      `
        ${SELECT_TASK}
        WHERE (:search = '' OR t.title LIKE '%' || :search || '%' OR t.notes LIKE '%' || :search || '%')
          AND (
            :status = 'all'
            OR (:status = 'open' AND t.is_done = 0)
            OR (:status = 'done' AND t.is_done = 1)
          )
        ORDER BY ${ORDER_BY_CLAUSES[sortBy]}
      `,
      { search, status },
    );

    return rows.map(mapTaskRow);
  }

  findById(id: number): Task | null {
    const row = this.queryOne<TaskRow>(`${SELECT_TASK} WHERE t.id = :id`, { id });

    return row ? mapTaskRow(row) : null;
  }

  /**
   * `RETURNING id` (SQLite 3.35+) hands back the new row's id as part of the INSERT,
   * which beats `last_insert_rowid()` because it cannot be confused by a later write.
   *
   * The row is then re-read through `SELECT_TASK` so the caller gets the joined category
   * and the server-generated timestamps rather than a half-populated object.
   */
  create(input: CreateTaskInput): Task {
    const { title, notes = '', priority = TaskPriorities.Medium, categoryId = null } = input;

    const inserted = this.queryOne<{ id: number }>(
      `
        INSERT INTO tasks (title, notes, priority, category_id)
        VALUES (:title, :notes, :priority, :categoryId)
        RETURNING id
      `,
      { title, notes, priority, categoryId },
    );

    if (!inserted) throw new Error('The INSERT reported success but returned no id.');

    return this.requireById(Number(inserted.id));
  }

  /**
   * Partial update: only the fields actually present in `patch` reach the SQL.
   *
   * The column names come from the `UPDATABLE_COLUMNS` whitelist, so an unexpected key
   * in the payload can never become part of the statement - the values themselves stay
   * bound as usual. `updated_at` is stamped by SQLite so the clock is always the same one.
   */
  update(id: number, patch: UpdateTaskInput): Task | null {
    const changedFields = Object.keys(UPDATABLE_COLUMNS).filter(
      (field) => patch[field as keyof UpdateTaskInput] !== undefined,
    ) as Array<keyof typeof UPDATABLE_COLUMNS>;

    if (changedFields.length === 0) return this.findById(id);

    const assignments = changedFields.map((field) => `${UPDATABLE_COLUMNS[field]} = :${field}`);

    const parameters: QueryParameters = { id };

    for (const field of changedFields) parameters[field] = toSqliteValue(patch[field]);

    const changes = this.execute(
      `
        UPDATE tasks
        SET ${assignments.join(', ')}, updated_at = ${SQL_NOW}
        WHERE id = :id
      `,
      parameters,
    );

    // Zero rows changed means the id does not exist - report that instead of a stale read.
    return changes === 0 ? null : this.findById(id);
  }

  deleteById(id: number): boolean {
    return this.execute('DELETE FROM tasks WHERE id = :id', { id }) > 0;
  }

  /**
   * Bulk insert wrapped in a single transaction.
   *
   * Two reasons this matters: it is atomic (a failure on row 4 leaves zero rows behind),
   * and it is dramatically faster, because SQLite otherwise commits - and fsyncs - once
   * per statement.
   */
  seedDemoTasks(demoTasks: Array<CreateTaskInput>): Array<Task> {
    return this.transaction(() => {
      const categories = this.listCategories();

      return demoTasks.map((demoTask, index) => {
        const category = categories.length > 0 ? categories[index % categories.length] : undefined;

        return this.create({ ...demoTask, categoryId: category?.id ?? null });
      });
    });
  }

  /**
   * All the counters in one round trip.
   *
   * `SUM(<condition>)` works because SQLite evaluates a comparison to 1 or 0, and
   * COALESCE covers the empty table, where SUM returns NULL rather than 0.
   */
  getStats(): TaskStats {
    const row = this.queryOne<TaskStatsRow>(`
      SELECT
        COUNT(*)                                          AS total,
        COALESCE(SUM(is_done = 0), 0)                     AS open_count,
        COALESCE(SUM(is_done = 1), 0)                     AS done_count,
        COALESCE(SUM(priority = '${TaskPriorities.Low}'), 0)    AS low_count,
        COALESCE(SUM(priority = '${TaskPriorities.Medium}'), 0) AS medium_count,
        COALESCE(SUM(priority = '${TaskPriorities.High}'), 0)   AS high_count
      FROM tasks
    `);

    return {
      total: row?.total ?? 0,
      open: row?.open_count ?? 0,
      done: row?.done_count ?? 0,
      byPriority: {
        [TaskPriorities.Low]: row?.low_count ?? 0,
        [TaskPriorities.Medium]: row?.medium_count ?? 0,
        [TaskPriorities.High]: row?.high_count ?? 0,
      },
    };
  }

  listCategories(): Array<TaskCategory> {
    return this.queryAll<TaskCategory>('SELECT id, name, color FROM categories ORDER BY name COLLATE NOCASE ASC');
  }

  private requireById(id: number): Task {
    const task = this.findById(id);

    if (!task) throw new Error(`Task ${id} could not be read back after writing it.`);

    return task;
  }
}
