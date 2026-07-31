import { Link } from 'react-router';
import { TASKS_URL } from '@renderer/common/constants';
import CategoryChip from '@renderer/components/CategoryChip';
import PriorityBadge from '@renderer/components/PriorityBadge';
import clsx from 'clsx';
import type { Task } from '@root/common/types';

type TaskListItemProps = {
  task: Task;
  onToggleDone: (task: Task) => void;
  onDelete: (task: Task) => void;
};

export default function TaskListItem(props: TaskListItemProps): React.JSX.Element {
  const { task, onToggleDone, onDelete } = props;

  return (
    <li className='flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition-colors hover:border-blue-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-500'>
      <input
        type='checkbox'
        checked={task.isDone}
        onChange={() => onToggleDone(task)}
        aria-label={`Mark "${task.title}" as ${task.isDone ? 'open' : 'done'}`}
        className='size-4 shrink-0 cursor-pointer accent-blue-500'
      />

      {/* The row id is the route parameter, so the details page can re-read it from SQLite. */}
      <Link to={`${TASKS_URL}/${task.id}`} className='flex min-w-0 flex-1 flex-col gap-0.5'>
        <span
          className={clsx(
            'truncate text-sm font-medium',
            task.isDone ? 'text-gray-400 line-through dark:text-gray-500' : 'text-gray-900 dark:text-white',
          )}
        >
          {task.title}
        </span>

        <span className='flex items-center gap-2'>
          <span className='font-mono text-xs text-gray-400 dark:text-gray-500'>#{task.id}</span>

          <CategoryChip name={task.categoryName} color={task.categoryColor} />
        </span>
      </Link>

      <PriorityBadge priority={task.priority} />

      <button
        type='button'
        onClick={() => onDelete(task)}
        aria-label={`Delete "${task.title}"`}
        className='shrink-0 cursor-pointer rounded-full px-2 py-1 text-sm text-gray-400 transition-colors hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-900/50 dark:hover:text-rose-300'
      >
        Delete
      </button>
    </li>
  );
}
