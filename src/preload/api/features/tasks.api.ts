import { ApiEvents } from '@root/common/constants';
import type { IpcService } from '@preload/ipc-service';
import type {
  CreateTaskInput,
  Task,
  TaskCategory,
  TaskChangedPayload,
  TaskQuery,
  TaskStats,
  UpdateTaskInput,
} from '@root/common/types';

/**
 * The renderer's view of the SQLite table: plain async CRUD, no SQL, no file access.
 *
 * Every method is an arrow-function class field and the transport lives in `#ipc` -
 * see the notes in `api.ts` for why `contextBridge` requires both.
 */
export class TasksApi {
  #ipc: IpcService;

  constructor(ipc: IpcService) {
    this.#ipc = ipc;
  }

  list = (query: TaskQuery = {}): Promise<Array<Task>> => this.#ipc.invoke<Array<Task>>(ApiEvents.TasksList, query);

  getById = (id: number): Promise<Task | null> => this.#ipc.invoke<Task | null>(ApiEvents.TasksGetById, id);

  create = (input: CreateTaskInput): Promise<Task> => this.#ipc.invoke<Task>(ApiEvents.TasksCreate, input);

  /** Resolves with `null` when the row no longer exists. */
  update = (id: number, patch: UpdateTaskInput): Promise<Task | null> =>
    this.#ipc.invoke<Task | null>(ApiEvents.TasksUpdate, id, patch);

  /** Resolves with `false` when there was nothing to delete. */
  remove = (id: number): Promise<boolean> => this.#ipc.invoke<boolean>(ApiEvents.TasksDelete, id);

  seedDemoData = (): Promise<Array<Task>> => this.#ipc.invoke<Array<Task>>(ApiEvents.TasksSeedDemoData);

  getStats = (): Promise<TaskStats> => this.#ipc.invoke<TaskStats>(ApiEvents.TasksGetStats);

  listCategories = (): Promise<Array<TaskCategory>> =>
    this.#ipc.invoke<Array<TaskCategory>>(ApiEvents.TasksListCategories);

  /** Fires after every write, in every window. Returns an unsubscribe function. */
  onChanged = (listener: (payload: TaskChangedPayload) => void): (() => void) =>
    this.#ipc.subscribe(ApiEvents.TasksChanged, listener);
}
