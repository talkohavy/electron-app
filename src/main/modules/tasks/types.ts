import type { TaskPriorityValues } from '@root/common/constants';
import type { TaskChangedPayload } from '@root/common/types';

/**
 * A row exactly as SQLite hands it back: snake_case columns, 0/1 instead of booleans.
 * Confined to the repository - `mapTaskRow` converts it into the shared `Task` type.
 */
export type TaskRow = {
  id: number;
  title: string;
  notes: string;
  is_done: number;
  priority: TaskPriorityValues;
  category_id: number | null;
  category_name: string | null;
  category_color: string | null;
  created_at: string;
  updated_at: string;
};

export type TaskStatsRow = {
  total: number;
  open_count: number;
  done_count: number;
  low_count: number;
  medium_count: number;
  high_count: number;
};

export type TaskChangedListener = (payload: TaskChangedPayload) => void;
