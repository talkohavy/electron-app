import { TaskPriorities, TaskSortKeys, TaskStatusFilters } from '@root/common/constants';
import type { TaskSortKeyValues } from '@root/common/constants';
import type { CreateTaskInput } from '@root/common/types';

export const MAX_TITLE_LENGTH = 120;
export const MAX_NOTES_LENGTH = 2000;

/**
 * The renderer may only pick a key from this map - it never sends SQL.
 *
 * `ORDER BY` is one of the few places a value cannot be bound, so interpolating a
 * client-supplied string here would be a genuine injection hole. A lookup table gives
 * the UI freedom to sort without ever letting it write SQL.
 */
export const ORDER_BY_CLAUSES: Record<TaskSortKeyValues, string> = {
  [TaskSortKeys.Newest]: 't.created_at DESC, t.id DESC',
  // COLLATE NOCASE makes the sort case-insensitive, so "apple" and "Banana" interleave.
  [TaskSortKeys.Title]: 't.title COLLATE NOCASE ASC',
  [TaskSortKeys.Priority]: `
    CASE t.priority WHEN '${TaskPriorities.High}' THEN 0 WHEN '${TaskPriorities.Medium}' THEN 1 ELSE 2 END ASC,
    t.created_at DESC
  `,
};

/**
 * Maps a domain field onto its column. Doubles as the whitelist for the partial UPDATE:
 * a key that is not in here can never reach the SQL string.
 */
export const UPDATABLE_COLUMNS = {
  title: 'title',
  notes: 'notes',
  isDone: 'is_done',
  priority: 'priority',
  categoryId: 'category_id',
} as const;

export const DEFAULT_TASK_QUERY = {
  search: '',
  status: TaskStatusFilters.All,
  sortBy: TaskSortKeys.Newest,
} as const;

export const DEMO_TASKS: Array<CreateTaskInput> = [
  { title: 'Read the SQLite docs on WAL mode', priority: TaskPriorities.Low, notes: 'Why readers stop blocking.' },
  { title: 'Add an index for the tasks list query', priority: TaskPriorities.High, notes: '' },
  { title: 'Buy milk, eggs and coffee', priority: TaskPriorities.Medium, notes: 'The corner shop closes at 20:00.' },
  { title: 'Sketch the migration for task tags', priority: TaskPriorities.Medium, notes: 'Many-to-many join table.' },
  { title: 'Benchmark prepared vs ad-hoc statements', priority: TaskPriorities.Low, notes: '' },
];
