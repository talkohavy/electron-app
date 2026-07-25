import { createWindow } from '@main/core/create-window';
import { AccentColors, MenuCommands, type AccentColorKeys } from '@root/common/constants';
import { isMac } from '@root/common/utils/isMac';
import {
  app,
  BrowserWindow,
  dialog,
  Menu,
  nativeTheme,
  shell,
  type MessageBoxOptions,
  type MenuItemConstructorOptions,
} from 'electron';
import { DICE_FACES, ELECTRON_MENU_DOCS, RANDOM_EMOJIS, RICK_ROLL_URL } from '../logic/constants';
import type {
  MenuCommandSender,
  ContextMenuRequest,
  NavigateCommand,
  AccentCommand,
  CounterAddCommand,
  ToastCommand,
} from '@root/common/types';

export class MenuService {
  private diceFaceIndex = Math.floor(Math.random() * DICE_FACES.length);
  private accent: AccentColorKeys = 'blue';
  private isAlwaysOnTop = false;

  constructor(private readonly sendMenuCommand: MenuCommandSender) {
    // A nicer native "About" panel on macOS (shown by the `about` role below).
    app.setAboutPanelOptions({
      applicationName: app.name,
      applicationVersion: app.getVersion(),
      credits: 'My custom app, built for learning. Enjoy the ride.',
    });
  }

  /**
   * Builds the template and installs it as THE application menu (replacing Electron's default).
   */
  build(): void {
    const menuTemplate = this.buildTemplate();
    const customMenu = Menu.buildFromTemplate(menuTemplate);

    Menu.setApplicationMenu(customMenu);
  }

  /**
   * Pops a native context menu at the cursor. Built fresh each time so it can
   * reflect the current selection (e.g. show "Search for ..." only when text
   * is selected). This is a transient menu - `popup()` not `setApplicationMenu`.
   */
  popupContext(window: BrowserWindow, request: ContextMenuRequest): void {
    const { x, y, selectionText, isDarkMode } = request;
    const hasSelection = Boolean(selectionText?.trim());

    const template: MenuItemConstructorOptions[] = [
      {
        label: isMac() ? '\u{1F311} Toggle Dark Mode' : '\u{1F311} Toggle Dark/Light',
        accelerator: 'CmdOrCtrl+D',
        click: () => {
          this.sendMenuCommand({
            type: MenuCommands.ToggleTheme,
            payload: { isDarkMode },
          });
        },
      },
      { type: 'separator' },
      { role: 'copy' },
      { role: 'paste' },
    ];

    if (hasSelection) {
      const snippet = selectionText!.trim().slice(0, 24);
      template.push(
        { type: 'separator' },
        {
          label: `\u{1F50D} Search web for "${snippet}${selectionText!.length > 24 ? '\u2026' : ''}"`,
          click: () => {
            shell.openExternal(`https://duckduckgo.com/?q=${encodeURIComponent(selectionText!.trim())}`);
          },
        },
      );
    }

    template.push(
      { type: 'separator' },
      { role: 'reload' },
      {
        label: '\u{1F50E} Inspect Element',
        click: () => {
          window.webContents.inspectElement(x, y);
        },
      },
    );

    const menu = Menu.buildFromTemplate(template);

    menu.popup({ window, x, y });
  }

  // --- template assembly -----------------------------------------------------

  private buildTemplate(): MenuItemConstructorOptions[] {
    return [
      ...this.appMenu(),
      this.fileMenu(),
      this.editMenu(),
      this.viewMenu(),
      this.counterMenu(),
      this.playgroundMenu(),
      this.windowMenu(),
      this.helpMenu(),
    ];
  }

  /**
   * The macOS-only application menu (the bold one named after the app).
   */
  private appMenu(): MenuItemConstructorOptions[] {
    if (!isMac()) return [];

    return [
      {
        label: app.name,
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          /**
           * The only custom item in the app menu.
           */
          {
            label: 'Preferences\u2026',
            accelerator: 'Cmd+,',
            click: () => {
              const command: NavigateCommand = {
                type: MenuCommands.Navigate,
                payload: { to: '/home' },
              };

              this.sendMenuCommand(command);
            },
          },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'close' },
          { role: 'quit' },
          { role: 'toggleDevTools', accelerator: 'F11' },
          // { type: 'separator' },
          // { role: 'appMenu' },
          // { role: 'clearRecentDocuments' },
          // { role: 'front' },
          // { role: 'help' },
          // { role: 'mergeAllWindows' },
          // { role: 'minimize' },
          // { role: 'recentDocuments' },
          // { role: 'window' },
          // { role: 'windowMenu' },
          // { role: 'viewMenu' },
          // { role: 'toggleTextReplacement' },
          // { role: 'toggleTabBar' },
          // { role: 'toggleSpellChecker' },
          // { role: 'startSpeaking' },
          // { role: 'stopSpeaking' },
          // { role: 'showSubstitutions' },
          // { role: 'showAllTabs' },
          // { role: 'shareMenu' },
        ],
      },
    ];
  }

  private fileMenu(): MenuItemConstructorOptions {
    return {
      label: 'File',
      submenu: [
        {
          label: 'New Window',
          accelerator: 'CmdOrCtrl+N',
          click: createWindow,
        },
        {
          label: 'Open Folder\u2026',
          accelerator: 'CmdOrCtrl+O',
          click: this.openFolder.bind(this),
        },
        { type: 'separator' },
        { role: 'close' },
        // On macOS "Quit" lives in the app menu; give the other platforms one here.
        ...(isMac() ? [] : ([{ role: 'quit' }] as MenuItemConstructorOptions[])),
      ],
    };
  }

  /**
   * Pure roles - Electron wires these to the focused input's native edit actions.
   */
  private editMenu(): MenuItemConstructorOptions {
    return {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    };
  }

  private viewMenu(): MenuItemConstructorOptions {
    return {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { type: 'separator' },
        {
          // A checkbox item: Electron tracks the `checked` state for us.
          label: 'Always on Top',
          type: 'checkbox',
          checked: this.isAlwaysOnTop,
          click: (item) => {
            this.toggleAlwaysOnTop(item.checked);
          },
        },
        {
          label: 'Accent Color',
          submenu: this.accentSubmenu(),
        },
      ],
    };
  }

  /**
   * A radio group: exactly one stays checked; picking one broadcasts an accent command.
   */
  private accentSubmenu(): MenuItemConstructorOptions[] {
    const accentKeys = Object.keys(AccentColors) as AccentColorKeys[];

    return accentKeys.map((accent) => ({
      label: accent.charAt(0).toUpperCase() + accent.slice(1),
      type: 'radio',
      checked: this.accent === accent,
      click: () => {
        this.accent = accent;

        const command: AccentCommand = {
          type: MenuCommands.Accent,
          payload: { accent },
        };

        this.sendMenuCommand(command);
      },
    }));
  }

  /**
   * Drives the counter feature entirely from the menu. Rather than reaching into
   * CounterService (cross-module coupling), it asks the renderer to make the
   * call - a nice demo of a menu -> renderer -> main round trip.
   */
  private counterMenu(): MenuItemConstructorOptions {
    return {
      label: 'Counter',
      submenu: [
        {
          label: 'Increment +1',
          accelerator: 'CmdOrCtrl+Up',
          click: () => {
            const command: CounterAddCommand = {
              type: MenuCommands.CounterAdd,
              payload: { delta: 1 },
            };

            this.sendMenuCommand(command);
          },
        },
        {
          label: 'Increment +5',
          accelerator: 'CmdOrCtrl+Shift+Up',
          click: () => {
            const command: CounterAddCommand = {
              type: MenuCommands.CounterAdd,
              payload: { delta: 5 },
            };

            this.sendMenuCommand(command);
          },
        },
        {
          label: 'Decrement -1',
          accelerator: 'CmdOrCtrl+Down',
          click: () => {
            const command: CounterAddCommand = {
              type: MenuCommands.CounterAdd,
              payload: { delta: -1 },
            };

            this.sendMenuCommand(command);
          },
        },
      ],
    };
  }

  /** The "have fun with it" menu. */
  private playgroundMenu(): MenuItemConstructorOptions {
    return {
      label: '\u{1F389} Playground',
      submenu: [
        {
          // Runtime-mutating label: reroll picks a new face and rebuilds the menu.
          label: `Reroll dice  ${DICE_FACES[this.diceFaceIndex]}`,
          accelerator: 'CmdOrCtrl+R',
          registerAccelerator: false, // <--- don't steal the actual reload shortcut
          click: this.rerollDice.bind(this),
        },
        {
          label: 'Random emoji',
          click: () => {
            const randomEmoji = RANDOM_EMOJIS[Math.floor(Math.random() * RANDOM_EMOJIS.length)]!;

            const command: ToastCommand = {
              type: MenuCommands.Toast,
              payload: {
                message: 'A wild emoji appears!',
                emoji: randomEmoji,
              },
            };

            this.sendMenuCommand(command);
          },
        },
        {
          label: 'Say hi from the menu',
          click: () => {
            const command: ToastCommand = {
              type: MenuCommands.Toast,
              payload: {
                message: 'Hello from the native menu \u{1F44B}',
                emoji: '\u{1F5A5}\uFE0F',
              },
            };

            this.sendMenuCommand(command);
          },
        },
        { type: 'separator' },
        {
          label: 'Pick a mood',
          submenu: ['\u{1F60E} Cool', '\u{1F913} Focused', '\u{1F973} Party', '\u{1F634} Sleepy'].map((mood, i) => ({
            label: mood,
            type: 'radio',
            checked: i === 0,
            click: () => {
              const command: ToastCommand = {
                type: MenuCommands.Toast,
                payload: {
                  message: `Mood set to ${mood}`,
                  emoji: '\u{1F3AD}',
                },
              };

              this.sendMenuCommand(command);
            },
          })),
        },
        { type: 'separator' },
        {
          label: 'Never gonna give you up\u2026',
          toolTip: 'Trust me, click it.',
          click: () => shell.openExternal(RICK_ROLL_URL),
        },
        {
          label: 'Coming soon\u2026',
          enabled: false, // a disabled item, greyed out
        },
      ],
    };
  }

  private windowMenu(): MenuItemConstructorOptions {
    return {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac()
          ? ([{ type: 'separator' }, { role: 'front' }] as MenuItemConstructorOptions[])
          : ([{ role: 'close' }] as MenuItemConstructorOptions[])),
      ],
    };
  }

  private helpMenu(): MenuItemConstructorOptions {
    return {
      role: 'help',
      submenu: [
        {
          label: 'Learn about Electron menus',
          click: () => shell.openExternal(ELECTRON_MENU_DOCS),
        },
        {
          label: 'About this app',
          click: this.showAbout.bind(this),
        },
      ],
    };
  }

  // --- actions ---------------------------------------------------------------

  private focusedWindow(): BrowserWindow | undefined {
    return BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];
  }

  private rerollDice(): void {
    this.diceFaceIndex =
      (this.diceFaceIndex + 1 + Math.floor(Math.random() * (DICE_FACES.length - 1))) % DICE_FACES.length;

    // Rebuilding is how you "update" a native menu - items are immutable snapshots.
    this.build();

    const command: ToastCommand = {
      type: MenuCommands.Toast,
      payload: {
        message: 'You rolled a die',
        emoji: DICE_FACES[this.diceFaceIndex],
      },
    };

    this.sendMenuCommand(command);
  }

  private toggleAlwaysOnTop(isChecked: boolean): void {
    this.isAlwaysOnTop = isChecked;
    const targetWindow = this.focusedWindow();

    if (!targetWindow) return;

    targetWindow.setAlwaysOnTop(isChecked);

    const command: ToastCommand = {
      type: MenuCommands.Toast,
      payload: {
        message: `Always on top ${isChecked ? 'ON' : 'OFF'}`,
        emoji: isChecked ? '\u{1F4CC}' : '\u{1F513}',
      },
    };

    this.sendMenuCommand(command);
  }

  private async openFolder(): Promise<void> {
    const targetWindow = this.focusedWindow();

    if (!targetWindow) return;

    const options = {
      title: 'Pick a folder',
      properties: ['openDirectory'] as const,
    };

    const result = targetWindow
      ? await dialog.showOpenDialog(targetWindow, { ...options, properties: [...options.properties] })
      : await dialog.showOpenDialog({ ...options, properties: [...options.properties] });

    if (result.canceled || !result.filePaths[0]) return;

    const command: ToastCommand = {
      type: MenuCommands.Toast,
      payload: {
        message: `Opened ${result.filePaths[0]}`,
        emoji: '\u{1F4C1}',
      },
    };

    this.sendMenuCommand(command);
  }

  private showAbout(): void {
    const targetWindow = this.focusedWindow();

    const aboutDetails = [
      `Version: ${app.getVersion()}`,
      `Electron: ${process.versions.electron}`,
      `Theme: ${nativeTheme.shouldUseDarkColors ? 'dark' : 'light'}`,
    ].join('\n');

    const options: MessageBoxOptions = {
      type: 'info',
      title: 'About this app',
      message: `${app.name} \u{1F468}\u200D\u{1F373}`,
      detail: aboutDetails,
      buttons: ['Ok', 'Star on GitHub'],
      defaultId: 0,
      cancelId: 0,
    };

    const handleClick = (response: number): void => {
      if (response === 1) {
        // Star on GitHub button clicked
        shell.openExternal('https://github.com/electron/electron');
      }
    };

    if (targetWindow) {
      dialog.showMessageBox(targetWindow, options).then((r) => handleClick(r.response));
    } else {
      dialog.showMessageBox(options).then((r) => handleClick(r.response));
    }
  }
}
