export const ApiEvents = {
  // System
  SystemGetInfo: 'system:getInfo',

  // Dialog
  DialogSelectFolder: 'dialog:selectFolder',

  // Counter
  CounterGet: 'counter:get',
  CounterIncrement: 'counter:increment',
  CounterChanged: 'counter:changed',

  // Clock
  ClockSetRunning: 'clock:setRunning',
  ClockTick: 'clock:tick',

  // Menu
  MenuCommand: 'menu:command',
  MenuShowContext: 'menu:showContextMenu',

  // Tasks (SQLite CRUD)
  TasksList: 'tasks:list',
  TasksGetById: 'tasks:getById',
  TasksCreate: 'tasks:create',
  TasksUpdate: 'tasks:update',
  TasksDelete: 'tasks:delete',
  TasksSeedDemoData: 'tasks:seedDemoData',
  TasksGetStats: 'tasks:getStats',
  TasksListCategories: 'tasks:listCategories',
  TasksChanged: 'tasks:changed',
} as const;

export type ApiEventValues = (typeof ApiEvents)[keyof typeof ApiEvents];
