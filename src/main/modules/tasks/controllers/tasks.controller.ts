import { ApiEvents } from '@root/common/constants';
import type { IpcBridgeService } from '@main/core/ipc-bridge';
import type { TaskQuery, UpdateTaskInput, CreateTaskInput } from '@root/common/types';
import type { TasksService } from '../services/tasks.service';

export class TasksController {
  constructor(
    private readonly bridge: IpcBridgeService,
    private readonly tasksService: TasksService,
  ) {}

  register(): void {
    this.listTasks();
    this.getTaskById();
    this.createTask();
    this.updateTask();
    this.deleteTask();
    this.seedDemoData();
    this.getStats();
    this.listCategories();
    this.broadcastChanges();
  }

  private listTasks() {
    this.bridge.handle(ApiEvents.TasksList, (_event, query: TaskQuery) => this.tasksService.list(query));
  }

  private getTaskById() {
    this.bridge.handle(ApiEvents.TasksGetById, (_event, id: number) => this.tasksService.getById(id));
  }

  /**
   * Writes use `handle`, not `on`: the renderer needs the stored row back (with its id and
   * timestamps), and it needs to hear about a rejected validation error.
   */
  private createTask() {
    this.bridge.handle(ApiEvents.TasksCreate, (_event, input: CreateTaskInput) => this.tasksService.create(input));
  }

  private updateTask() {
    this.bridge.handle(ApiEvents.TasksUpdate, (_event, id: number, patch: UpdateTaskInput) =>
      this.tasksService.update(id, patch),
    );
  }

  private deleteTask() {
    this.bridge.handle(ApiEvents.TasksDelete, (_event, id: number) => this.tasksService.delete(id));
  }

  private seedDemoData() {
    this.bridge.handle(ApiEvents.TasksSeedDemoData, () => this.tasksService.seedDemoData());
  }

  private getStats() {
    this.bridge.handle(ApiEvents.TasksGetStats, () => this.tasksService.getStats());
  }

  private listCategories() {
    this.bridge.handle(ApiEvents.TasksListCategories, () => this.tasksService.listCategories());
  }

  /**
   * The database is shared by every window, so a write in one has to invalidate the others.
   * Broadcasting the *reason* (rather than the new list) keeps each window free to re-query
   * with its own search and filters.
   */
  private broadcastChanges() {
    this.tasksService.onChange((payload) => this.bridge.broadcast(ApiEvents.TasksChanged, payload));
  }
}
