import { BrowserWindow, globalShortcut } from 'electron';

export function registerGlobalShortcuts(): void {
  globalShortcut.register('CommandOrControl+Shift+6', () => {
    BrowserWindow.getAllWindows()[0]?.show();
  });
}
