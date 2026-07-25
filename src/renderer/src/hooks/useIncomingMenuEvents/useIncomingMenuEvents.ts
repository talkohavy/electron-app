import { useCallback, useEffect, useMemo } from 'react';
import { useIpcIncomingEvent } from '@renderer/hooks/useIpcIncomingEvent';
import { ipcClient } from '@renderer/lib/ipc';
import { MenuCommands } from '@root/common/constants';
import { useAccentHandler } from './logic/hooks/useAccentHandler';
import { useCounterAddHandler } from './logic/hooks/useCounterAddHandler';
import { useNavigationHandler } from './logic/hooks/useNavigationHandler';
import { useThemeToggleHandler } from './logic/hooks/useThemeToggleHandler';
import { useToastHandler } from './logic/hooks/useToastHandler';
import type { MenuCommandMessage } from '@root/common/types';

export function useIncomingMenuEvents() {
  const { handleToast } = useToastHandler();
  const { handleToggleTheme } = useThemeToggleHandler();
  const { handleNavigate } = useNavigationHandler();
  const { handleCounterAdd } = useCounterAddHandler();
  const { handleAccent } = useAccentHandler();

  const commandToHandlerMap = useMemo(() => {
    return {
      [MenuCommands.Toast]: handleToast,
      [MenuCommands.ToggleTheme]: handleToggleTheme,
      [MenuCommands.Navigate]: handleNavigate,
      [MenuCommands.CounterAdd]: handleCounterAdd,
      [MenuCommands.Accent]: handleAccent,
    };
  }, [handleToast, handleToggleTheme, handleNavigate, handleCounterAdd, handleAccent]);

  const handleIncomingEvent = useCallback((command: MenuCommandMessage) => {
    const { type, payload } = command;

    const handler = commandToHandlerMap[type];

    if (!handler) return;

    handler(payload);
  }, []);

  useIpcIncomingEvent(ipcClient.menu.onCommand, handleIncomingEvent);

  // Replace the browser's default context menu with our native one.
  useEffect(() => {
    const onContextMenu = (event: MouseEvent): void => {
      event.preventDefault();

      ipcClient.menu.showContextMenu({
        x: Math.round(event.clientX),
        y: Math.round(event.clientY),
        selectionText: window.getSelection()?.toString() ?? '',
      });
    };

    window.addEventListener('contextmenu', onContextMenu);

    return () => window.removeEventListener('contextmenu', onContextMenu);
  }, []);
}
