import { ApiEvents } from '@root/common/constants';
import { MenuController } from './controllers/menu.controller';
import { MenuService } from './services/menu.service';
import type { IpcBridgeService } from '@main/core/ipc-bridge';
import type { MenuCommandMessage } from '@root/common/types';

export function initMenuModule(bridge: IpcBridgeService) {
  // Wrap broadcast so the service stays free of IPC channel knowledge.
  const sendMenuCommand = (command: MenuCommandMessage): void => bridge.broadcast(ApiEvents.MenuCommand, command);

  const menuService = new MenuService(sendMenuCommand);

  const menuController = new MenuController(bridge, menuService);

  menuController.register();

  // Replace Electron's default menu with ours.
  menuService.build();
}
