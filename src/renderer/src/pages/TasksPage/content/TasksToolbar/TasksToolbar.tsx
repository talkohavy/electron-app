import { FIELD_CLASS_NAME } from '@renderer/common/constants';
import { TaskSortKeys, TaskStatusFilters } from '@root/common/constants';
import clsx from 'clsx';
import type { TaskSortKeyValues, TaskStatusFilterValues } from '@root/common/constants';

const SORT_LABELS: Record<TaskSortKeyValues, string> = {
  [TaskSortKeys.Newest]: 'Newest first',
  [TaskSortKeys.Title]: 'Title A-Z',
  [TaskSortKeys.Priority]: 'Priority',
};

type TasksToolbarProps = {
  search: string;
  onSearchChange: (search: string) => void;
  status: TaskStatusFilterValues;
  onStatusChange: (status: TaskStatusFilterValues) => void;
  sortBy: TaskSortKeyValues;
  onSortByChange: (sortBy: TaskSortKeyValues) => void;
};

/**
 * Drives the WHERE and ORDER BY of the list query. The sort control sends a key
 * (`newest`), never a column - the main process maps it to SQL.
 */
export default function TasksToolbar(props: TasksToolbarProps): React.JSX.Element {
  const { search, onSearchChange, status, onStatusChange, sortBy, onSortByChange } = props;

  return (
    <div className='flex w-full flex-wrap items-center gap-3'>
      <input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder='Search title and notes (SQL LIKE)'
        className={`${FIELD_CLASS_NAME} flex-1`}
      />

      <div className='flex overflow-hidden rounded-full border border-gray-200 dark:border-slate-600'>
        {Object.values(TaskStatusFilters).map((statusOption) => (
          <button
            key={statusOption}
            type='button'
            onClick={() => onStatusChange(statusOption)}
            className={clsx(
              'cursor-pointer px-4 py-1.5 text-sm font-semibold capitalize transition-colors',
              statusOption === status
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700',
            )}
          >
            {statusOption}
          </button>
        ))}
      </div>

      <select
        value={sortBy}
        onChange={(event) => onSortByChange(event.target.value as TaskSortKeyValues)}
        className={`${FIELD_CLASS_NAME} w-fit`}
      >
        {Object.values(TaskSortKeys).map((sortKey) => (
          <option key={sortKey} value={sortKey}>
            {SORT_LABELS[sortKey]}
          </option>
        ))}
      </select>
    </div>
  );
}
