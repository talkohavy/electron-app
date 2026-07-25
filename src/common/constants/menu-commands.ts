export const MenuCommands = {
  Accent: 'accent',
  CounterAdd: 'counter-add',
  Navigate: 'navigate',
  Toast: 'toast',
  ToggleTheme: 'toggle-theme',
} as const;

export type MenuCommandValues = (typeof MenuCommands)[keyof typeof MenuCommands];
