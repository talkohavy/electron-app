import type { Task } from '@root/common/types';
import type { TaskRow } from '../types';

/**
 * The one place the storage shape is translated into the domain shape.
 *
 * Without a mapper like this, `is_done` (a number) and `category_name` leak all the way
 * into React components, and every consumer has to remember that 0 means false.
 */
export function mapTaskRow(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    isDone: row.is_done === 1,
    priority: row.priority,
    categoryId: row.category_id,
    categoryName: row.category_name,
    categoryColor: row.category_color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
