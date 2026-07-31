import { TaskChangeReasons } from '@root/common/constants';
import { DEMO_TASKS } from '../logic/constants';
import { normalizeCreateInput, normalizeId, normalizeUpdateInput } from '../logic/normalize-task-input';
import type {
  CreateTaskInput,
  Task,
  TaskCategory,
  TaskChangedPayload,
  TaskQuery,
  TaskStats,
  UpdateTaskInput,
} from '@root/common/types';
import type { TasksRepository } from '../repositories/tasks.repository';
import type { TaskChangedListener } from '../types';

/**
 * Validates input, delegates persistence to the repository, and announces changes.
 *
 * No SQL and no IPC knowledge live here: the repository owns the statements, the
 * controller owns the channels. That is what makes this class the interesting one to
 * read - and the only one you would need to test to cover the business rules.
 */
export class TasksService {
  private readonly listeners = new Set<TaskChangedListener>();

  constructor(private readonly tasksRepository: TasksRepository) {}

  list(query: TaskQuery = {}): Array<Task> {
    return this.tasksRepository.findAll(query);
  }

  getById(id: number): Task | null {
    return this.tasksRepository.findById(normalizeId(id));
  }

  create(input: CreateTaskInput): Task {
    const createdTask = this.tasksRepository.create(normalizeCreateInput(input));

    this.notify({ reason: TaskChangeReasons.Created, taskId: createdTask.id });

    return createdTask;
  }

  update(id: number, patch: UpdateTaskInput): Task | null {
    const updatedTask = this.tasksRepository.update(normalizeId(id), normalizeUpdateInput(patch));

    // Nothing was written when the row is gone, so nothing should be announced either.
    if (updatedTask) this.notify({ reason: TaskChangeReasons.Updated, taskId: updatedTask.id });

    return updatedTask;
  }

  delete(id: number): boolean {
    const validId = normalizeId(id);

    const wasDeleted = this.tasksRepository.deleteById(validId);

    if (wasDeleted) this.notify({ reason: TaskChangeReasons.Deleted, taskId: validId });

    return wasDeleted;
  }

  seedDemoData(): Array<Task> {
    const seededTasks = this.tasksRepository.seedDemoTasks(DEMO_TASKS);

    this.notify({ reason: TaskChangeReasons.Seeded, taskId: null });

    return seededTasks;
  }

  getStats(): TaskStats {
    return this.tasksRepository.getStats();
  }

  listCategories(): Array<TaskCategory> {
    return this.tasksRepository.listCategories();
  }

  /** Subscribe to writes. Returns an unsubscribe function. */
  onChange(listener: TaskChangedListener): () => void {
    this.listeners.add(listener);

    return () => this.listeners.delete(listener);
  }

  private notify(payload: TaskChangedPayload): void {
    for (const listener of this.listeners) listener(payload);
  }
}
