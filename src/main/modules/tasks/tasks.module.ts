import { TasksController } from './controllers/tasks.controller';
import { TasksRepository } from './repositories/tasks.repository';
import { TasksService } from './services/tasks.service';
import type { IpcBridgeService } from '@main/core/ipc-bridge';
import type { DatabaseService } from '@main/database';

/**
 * Composition root for the feature: repository (SQL) -> service (rules) -> controller (IPC).
 *
 * `DatabaseService` is injected rather than imported so the connection stays a single
 * instance owned by `start-server.ts`, and so a test could hand in an in-memory database.
 * It must already be connected - the repository prepares statements against live tables.
 */
export function initTasksModule(bridge: IpcBridgeService, databaseService: DatabaseService) {
  const tasksRepository = new TasksRepository(databaseService);

  const tasksService = new TasksService(tasksRepository);

  const tasksController = new TasksController(bridge, tasksService);

  tasksController.register();
}
