import { Link } from 'react-router';
import { SUBTLE_BUTTON_CLASS_NAME, TASKS_URL } from '@renderer/common/constants';
import CategoryChip from '@renderer/components/CategoryChip';
import PriorityBadge from '@renderer/components/PriorityBadge';
import TaskEditForm from './content/TaskEditForm';
import { useTaskDetailsPageLogic } from './logic/useTaskDetailsPageLogic';

export default function TaskDetailsPage(): React.JSX.Element {
  const { task, isLoading, isSaving, saveTask, deleteTask } = useTaskDetailsPageLogic();

  return (
    <div className='mx-auto flex w-full max-w-2xl flex-col items-start gap-5 p-6 md:p-8'>
      <Link to={TASKS_URL} className={SUBTLE_BUTTON_CLASS_NAME}>
        Back to all tasks
      </Link>

      {isLoading && <p className='text-sm text-gray-400 dark:text-gray-500'>Selecting the row...</p>}

      {!isLoading && !task && (
        <div className='flex flex-col gap-1'>
          <h1 className='text-xl font-extrabold text-gray-900 dark:text-white'>No such row</h1>

          <p className='text-sm text-gray-500 dark:text-gray-400'>
            This task was deleted, or the id in the URL never existed.
          </p>
        </div>
      )}

      {task && (
        <>
          <div className='flex w-full flex-col gap-2'>
            <div className='flex items-center gap-2'>
              <span className='font-mono text-sm text-gray-400 dark:text-gray-500'>row #{task.id}</span>

              <PriorityBadge priority={task.priority} />

              <CategoryChip name={task.categoryName} color={task.categoryColor} />
            </div>

            <h1 className='text-2xl font-extrabold text-gray-900 dark:text-white'>{task.title}</h1>

            <dl className='flex flex-wrap gap-x-6 text-xs text-gray-400 dark:text-gray-500'>
              <div className='flex gap-1'>
                <dt>created</dt>
                <dd className='font-mono'>{new Date(task.createdAt).toLocaleString()}</dd>
              </div>

              <div className='flex gap-1'>
                <dt>updated</dt>
                <dd className='font-mono'>{new Date(task.updatedAt).toLocaleString()}</dd>
              </div>
            </dl>
          </div>

          <TaskEditForm task={task} isSaving={isSaving} onSave={saveTask} onDelete={deleteTask} />
        </>
      )}
    </div>
  );
}
