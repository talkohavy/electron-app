import { useCallback, useEffect, useState } from 'react';
import { showErrorToast, showSuccessToast } from '@renderer/common/utils/toast';
import { useIpcIncomingEvent } from '@renderer/hooks/useIpcIncomingEvent';
import { getIpcErrorMessage, ipcClient } from '@renderer/lib/ipc';
import { TaskSortKeys, TaskStatusFilters } from '@root/common/constants';
import type { TaskSortKeyValues, TaskStatusFilterValues } from '@root/common/constants';
import type { CreateTaskInput, Task, TaskStats } from '@root/common/types';

export function useTasksPageLogic() {
  const [tasks, setTasks] = useState<Array<Task>>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<TaskStatusFilterValues>(TaskStatusFilters.All);
  const [sortBy, setSortBy] = useState<TaskSortKeyValues>(TaskSortKeys.Newest);

  /**
   * The query runs in SQLite, not in JavaScript: filtering and sorting a list this small
   * in the renderer would work, but it would stop working the moment the table grows past
   * what is sensible to ship over IPC. Let the database do what it is good at.
   */
  const refresh = useCallback(async () => {
    try {
      const [nextTasks, nextStats] = await Promise.all([
        ipcClient.tasks.list({ search, status, sortBy }),
        ipcClient.tasks.getStats(),
      ]);

      setTasks(nextTasks);
      setStats(nextStats);
    } catch (error) {
      showErrorToast({ title: getIpcErrorMessage(error, 'Could not load the tasks.') });
    } finally {
      setIsLoading(false);
    }
  }, [search, status, sortBy]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * Re-query on any write from any window, so two windows never disagree about the table.
   * The payload is only a reason, so this is a deliberate cache invalidation rather than
   * an attempt to patch local state and hope it matches what was stored.
   */
  useIpcIncomingEvent(ipcClient.tasks.onChanged, refresh);

  const createTask = useCallback(async (input: CreateTaskInput) => {
    try {
      const createdTask = await ipcClient.tasks.create(input);

      showSuccessToast({ title: `Inserted "${createdTask.title}" as row #${createdTask.id}.` });

      return true;
    } catch (error) {
      // Validation happens in the main process, so its message is the one worth showing.
      showErrorToast({ title: getIpcErrorMessage(error, 'Could not insert the task.') });

      return false;
    }
  }, []);

  const toggleTaskDone = useCallback(async (task: Task) => {
    try {
      await ipcClient.tasks.update(task.id, { isDone: !task.isDone });
    } catch (error) {
      showErrorToast({ title: getIpcErrorMessage(error, 'Could not update the task.') });
    }
  }, []);

  const deleteTask = useCallback(async (task: Task) => {
    try {
      const wasDeleted = await ipcClient.tasks.remove(task.id);

      if (!wasDeleted) return showErrorToast({ title: `Row #${task.id} was already gone.` });

      showSuccessToast({ title: `Deleted row #${task.id}.` });
    } catch (error) {
      showErrorToast({ title: getIpcErrorMessage(error, 'Could not delete the task.') });
    }
  }, []);

  const seedDemoData = useCallback(async () => {
    try {
      const seededTasks = await ipcClient.tasks.seedDemoData();

      showSuccessToast({ title: `Inserted ${seededTasks.length} rows in one transaction.` });
    } catch (error) {
      showErrorToast({ title: getIpcErrorMessage(error, 'Could not insert the sample rows.') });
    }
  }, []);

  return {
    tasks,
    stats,
    isLoading,
    search,
    setSearch,
    status,
    setStatus,
    sortBy,
    setSortBy,
    createTask,
    toggleTaskDone,
    deleteTask,
    seedDemoData,
  };
}
