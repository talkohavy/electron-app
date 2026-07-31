import { electronApp } from '@electron-toolkit/utils';
import { ElectronEvents } from '@root/common/constants';
import { app } from 'electron';
import { attachAppEvents } from './core/attach-app-events';
import { createWindow } from './core/create-window';
import { IpcBridgeService } from './core/ipc-bridge';
import { registerGlobalShortcuts } from './core/register-global-shortcuts';
import { DatabaseService } from './database';
import { initClockModule } from './modules/clock';
import { initCounterModule } from './modules/counter';
import { initDialogModule } from './modules/dialog';
import { initMenuModule } from './modules/menu';
import { initSystemModule } from './modules/system';
import { initTasksModule } from './modules/tasks';

startApp();

async function startApp(): Promise<void> {
  // On macOS apps typically stay alive until the user quits with Cmd+Q.
  app.on(ElectronEvents.WindowAllClosed, () => {
    if (process.platform !== 'darwin') app.quit();
  });

  await app.whenReady();

  handleAppIsReady();
}

function handleAppIsReady(): void {
  electronApp.setAppUserModelId('com.electron');

  const ipcBridgeService = new IpcBridgeService();

  /**
   * Opened before any module, because modules that own data prepare their statements
   * against live tables. `connect()` also runs the pending migrations, so the schema is
   * guaranteed to be current by the time the window can issue its first query.
   *
   * It happens after `app.whenReady()` because the file path comes from
   * `app.getPath('userData')`, which is only resolvable once the app is ready.
   */
  const databaseService = new DatabaseService();

  databaseService.connect();

  app.on(ElectronEvents.Quit, () => databaseService.close());

  initMenuModule(ipcBridgeService);
  initClockModule(ipcBridgeService);
  initCounterModule(ipcBridgeService);
  initDialogModule(ipcBridgeService);
  initSystemModule(ipcBridgeService);
  initTasksModule(ipcBridgeService, databaseService);

  attachAppEvents(app);

  registerGlobalShortcuts();

  createWindow();
}
