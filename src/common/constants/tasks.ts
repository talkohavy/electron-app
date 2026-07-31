export const TaskPriorities = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
} as const;

export type TaskPriorityValues = (typeof TaskPriorities)[keyof typeof TaskPriorities];

export const TaskStatusFilters = {
  All: 'all',
  Open: 'open',
  Done: 'done',
} as const;

export type TaskStatusFilterValues = (typeof TaskStatusFilters)[keyof typeof TaskStatusFilters];

/**
 * A sort key is NOT a column name - the repository maps each key to a hard-coded
 * ORDER BY clause. `ORDER BY` cannot be parameterised, so the only safe way to let
 * the UI pick a sort order is a closed set of keys like this one.
 */
export const TaskSortKeys = {
  Newest: 'newest',
  Title: 'title',
  Priority: 'priority',
} as const;

export type TaskSortKeyValues = (typeof TaskSortKeys)[keyof typeof TaskSortKeys];

/** Tells subscribed windows *why* the tasks table changed, so they can react precisely. */
export const TaskChangeReasons = {
  Created: 'created',
  Updated: 'updated',
  Deleted: 'deleted',
  Seeded: 'seeded',
} as const;

export type TaskChangeReasonValues = (typeof TaskChangeReasons)[keyof typeof TaskChangeReasons];
