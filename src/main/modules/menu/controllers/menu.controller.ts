import { ApiEvents } from '@root/common/constants';
import { BrowserWindow } from 'electron';
import type { IpcBridgeService } from '@main/core/ipc-bridge';
import type { ContextMenuRequest } from '@root/common/types';
import type { MenuService } from '../services/menu.service';

export class MenuController {
  constructor(
    private readonly bridge: IpcBridgeService,
    private readonly menuService: MenuService,
  ) {}

  register(): void {
    this.showContextMenu();
  }

  // renderer -> main: "user right-clicked at (x, y), pop the native menu here".
  private showContextMenu() {
    this.bridge.on(ApiEvents.MenuShowContext, (event, request: ContextMenuRequest) => {
      const window = BrowserWindow.fromWebContents(event.sender);

      if (!window) return;

      this.menuService.popupContext(window, request);
    });
  }
}
