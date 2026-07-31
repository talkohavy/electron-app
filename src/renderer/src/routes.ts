import { lazy } from 'react';
import type { Route } from './common/types';

// Main pages
const HomePage = lazy(() => import('./pages/HomePage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const TaskDetailsPage = lazy(() => import('./pages/TaskDetailsPage'));

export const routes: Array<Route> = [
  {
    to: 'home',
    text: 'Home',
    Component: HomePage,
  },
  {
    to: 'tasks',
    text: 'Tasks (SQLite)',
    Component: TasksPage,
  },
  {
    // `:taskId` is the primary key the details page selects by - reached from the list.
    to: 'tasks/:taskId',
    text: 'Task details',
    Component: TaskDetailsPage,
    hideFromSidebar: true,
  },
];
