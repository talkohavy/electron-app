import type {
  TaskChangeReasonValues,
  TaskPriorityValues,
  TaskSortKeyValues,
  TaskStatusFilterValues,
} from '../constants';

/**
 * The shape the renderer works with: camelCase, real booleans, category already joined in.
 * The snake_case/0-or-1 row that SQLite actually stores never leaves the repository.
 */
export type Task = {
  id: number;
  title: string;
  notes: string;
  isDone: boolean;
  priority: TaskPriorityValues;
  categoryId: number | null;
  categoryName: string | null;
  categoryColor: string | null;
  /** ISO-8601 UTC string, e.g. `2026-07-31T18:47:39.334Z`. */
  createdAt: string;
  updatedAt: string;
};

export type TaskCategory = {
  id: number;
  name: string;
  color: string;
};

export type CreateTaskInput = {
  title: string;
  notes?: string;
  priority?: TaskPriorityValues;
  categoryId?: number | null;
};

/** Every field is optional - only the provided ones end up in the UPDATE statement. */
export type UpdateTaskInput = {
  title?: string;
  notes?: string;
  isDone?: boolean;
  priority?: TaskPriorityValues;
  categoryId?: number | null;
};

export type TaskQuery = {
  search?: string;
  status?: TaskStatusFilterValues;
  sortBy?: TaskSortKeyValues;
};

export type TaskStats = {
  total: number;
  open: number;
  done: number;
  byPriority: Record<TaskPriorityValues, number>;
};

export type TaskChangedPayload = {
  reason: TaskChangeReasonValues;
  /** `null` for changes that touch more than one row (e.g. seeding). */
  taskId: number | null;
};
