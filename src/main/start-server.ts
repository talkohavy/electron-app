import { electronApp, optimizer } from '@electron-toolkit/utils';
import { ElectronEvents } from '@root/common/constants';
import { app, BrowserWindow } from 'electron';
import { createWindow } from './core/create-window';
import { IpcBridgeService } from './core/ipc-bridge';
import { initClockModule } from './modules/clock';
import { initCounterModule } from './modules/counter';
import { initDialogModule } from './modules/dialog';
import { initMenuModule } from './modules/menu';
import { initSystemModule } from './modules/system';

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

  // F12 toggles DevTools in dev; ignore Cmd/Ctrl+R in production.
  app.on(ElectronEvents.BrowserWindowCreated, (_, window) => {
    optimizer.watchWindowShortcuts(window, {
      zoom: true, // <--- support cmd+/- to zoom in and out. Defaults to false.
      escToCloseWindow: true, // <--- support esc to close window. Defaults to false.
    });
  });

  // On macOS, re-create a window when the dock icon is clicked with none open.
  app.on(ElectronEvents.Activate, () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  const ipcBridgeService = new IpcBridgeService();

  initMenuModule(ipcBridgeService);
  initClockModule(ipcBridgeService);
  initCounterModule(ipcBridgeService);
  initDialogModule(ipcBridgeService);
  initSystemModule(ipcBridgeService);

  createWindow();
}
