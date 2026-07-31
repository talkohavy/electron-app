import { TaskPriorities } from '@root/common/constants';
import { MAX_NOTES_LENGTH, MAX_TITLE_LENGTH } from './constants';
import type { TaskPriorityValues } from '@root/common/constants';
import type { CreateTaskInput, UpdateTaskInput } from '@root/common/types';

/**
 * Everything arriving over IPC is untrusted input - it is whatever the renderer put on
 * the channel, and TypeScript types are gone by then. Normalising here means the
 * repository only ever sees values the schema will accept.
 */
export function normalizeCreateInput(input: CreateTaskInput): CreateTaskInput {
  return {
    title: normalizeTitle(input?.title),
    notes: normalizeNotes(input?.notes),
    priority: normalizePriority(input?.priority),
    categoryId: normalizeCategoryId(input?.categoryId),
  };
}

/**
 * Only the keys actually present survive, because `undefined` is what tells the
 * repository to leave a column alone.
 */
export function normalizeUpdateInput(patch: UpdateTaskInput): UpdateTaskInput {
  const normalized: UpdateTaskInput = {};

  if (patch?.title !== undefined) normalized.title = normalizeTitle(patch.title);

  if (patch?.notes !== undefined) normalized.notes = normalizeNotes(patch.notes);

  if (patch?.isDone !== undefined) normalized.isDone = Boolean(patch.isDone);

  if (patch?.priority !== undefined) normalized.priority = normalizePriority(patch.priority);

  if (patch?.categoryId !== undefined) normalized.categoryId = normalizeCategoryId(patch.categoryId);

  return normalized;
}

export function normalizeId(id: number): number {
  if (!Number.isInteger(id) || id <= 0) throw new Error(`"${id}" is not a valid task id.`);

  return id;
}

function normalizeTitle(title: unknown): string {
  const trimmedTitle = typeof title === 'string' ? title.trim() : '';

  if (!trimmedTitle) throw new Error('A task needs a title.');

  if (trimmedTitle.length > MAX_TITLE_LENGTH) {
    throw new Error(`A title cannot be longer than ${MAX_TITLE_LENGTH} characters.`);
  }

  return trimmedTitle;
}

function normalizeNotes(notes: unknown): string {
  const trimmedNotes = typeof notes === 'string' ? notes.trim() : '';

  if (trimmedNotes.length > MAX_NOTES_LENGTH) {
    throw new Error(`Notes cannot be longer than ${MAX_NOTES_LENGTH} characters.`);
  }

  return trimmedNotes;
}

function normalizePriority(priority: unknown): TaskPriorityValues {
  const allowedPriorities = Object.values(TaskPriorities);

  if (priority === undefined || priority === null) return TaskPriorities.Medium;

  if (!allowedPriorities.includes(priority as TaskPriorityValues)) {
    throw new Error(`"${String(priority)}" is not one of: ${allowedPriorities.join(', ')}.`);
  }

  return priority as TaskPriorityValues;
}

function normalizeCategoryId(categoryId: unknown): number | null {
  if (categoryId === undefined || categoryId === null) return null;

  const parsedCategoryId = Number(categoryId);

  if (!Number.isInteger(parsedCategoryId) || parsedCategoryId <= 0) {
    throw new Error(`"${String(categoryId)}" is not a valid category id.`);
  }

  return parsedCategoryId;
}
