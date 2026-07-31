import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { TASKS_URL } from '@renderer/common/constants';
import { showErrorToast, showSuccessToast } from '@renderer/common/utils/toast';
import { useIpcIncomingEvent } from '@renderer/hooks/useIpcIncomingEvent';
import { getIpcErrorMessage, ipcClient } from '@renderer/lib/ipc';
import { TaskChangeReasons } from '@root/common/constants';
import type { Task, TaskChangedPayload, UpdateTaskInput } from '@root/common/types';

export function useTaskDetailsPageLogic() {
  const { taskId } = useParams();
  const navigateTo = useNavigate();

  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // The route parameter is a string, and could be anything the user typed into the URL.
  const parsedTaskId = Number(taskId);

  const loadTask = useCallback(async () => {
    if (!Number.isInteger(parsedTaskId) || parsedTaskId <= 0) {
      setIsLoading(false);

      return;
    }

    try {
      // A fresh SELECT by primary key - the list page's copy is never trusted or passed in.
      setTask(await ipcClient.tasks.getById(parsedTaskId));
    } catch (error) {
      showErrorToast({ title: getIpcErrorMessage(error, 'Could not load this task.') });
    } finally {
      setIsLoading(false);
    }
  }, [parsedTaskId]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  /**
   * Another window (or the native menu) can delete the row this page is showing, so
   * re-read on any change that concerns this id and let the "not found" state take over.
   */
  const onTasksChanged = useCallback(
    (payload: TaskChangedPayload) => {
      const isThisTask = payload.taskId === parsedTaskId;

      if (isThisTask && payload.reason === TaskChangeReasons.Deleted) return setTask(null);

      if (isThisTask) loadTask();
    },
    [parsedTaskId, loadTask],
  );

  useIpcIncomingEvent(ipcClient.tasks.onChanged, onTasksChanged);

  const saveTask = useCallback(
    async (patch: UpdateTaskInput) => {
      setIsSaving(true);

      try {
        const updatedTask = await ipcClient.tasks.update(parsedTaskId, patch);

        if (!updatedTask) return showErrorToast({ title: `Row #${parsedTaskId} no longer exists.` });

        setTask(updatedTask);

        showSuccessToast({ title: `Updated row #${updatedTask.id}.` });
      } catch (error) {
        showErrorToast({ title: getIpcErrorMessage(error, 'Could not save this task.') });
      } finally {
        setIsSaving(false);
      }
    },
    [parsedTaskId],
  );

  const deleteTask = useCallback(async () => {
    try {
      await ipcClient.tasks.remove(parsedTaskId);

      navigateTo(TASKS_URL);
    } catch (error) {
      showErrorToast({ title: getIpcErrorMessage(error, 'Could not delete this task.') });
    }
  }, [parsedTaskId, navigateTo]);

  return { task, isLoading, isSaving, saveTask, deleteTask };
}
