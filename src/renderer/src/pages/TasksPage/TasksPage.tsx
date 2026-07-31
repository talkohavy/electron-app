import { SUBTLE_BUTTON_CLASS_NAME } from '@renderer/common/constants';
import { TaskStatusFilters } from '@root/common/constants';
import CreateTaskForm from './content/CreateTaskForm';
import TaskListItem from './content/TaskListItem';
import TaskStatsBar from './content/TaskStatsBar';
import TasksToolbar from './content/TasksToolbar';
import { useTasksPageLogic } from './logic/useTasksPageLogic';

export default function TasksPage(): React.JSX.Element {
  const {
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
  } = useTasksPageLogic();

  return (
    <div className='mx-auto flex w-full max-w-3xl flex-col items-center gap-6 p-6 md:p-8'>
      <div className='text-center'>
        <h1 className='select-all text-2xl font-extrabold text-gray-900 dark:text-white'>SQLite CRUD Demo</h1>

        <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
          A real table on disk, read and written by <code className='font-mono'>node:sqlite</code> in the main process.
          The renderer only ever sees plain objects over IPC.
        </p>
      </div>

      <TaskStatsBar stats={stats} />

      <CreateTaskForm onSubmit={createTask} />

      <TasksToolbar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      {isLoading && <p className='text-sm text-gray-400 dark:text-gray-500'>Reading the tasks table...</p>}

      {!isLoading && tasks.length === 0 && (
        <div className='flex flex-col items-center gap-3 py-6 text-center'>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            {search || status !== TaskStatusFilters.All ? 'No rows match this query.' : 'The tasks table is empty.'}
          </p>

          <button type='button' onClick={seedDemoData} className={SUBTLE_BUTTON_CLASS_NAME}>
            Insert 5 sample rows in one transaction
          </button>
        </div>
      )}

      {tasks.length > 0 && (
        <ul className='flex w-full list-none flex-col gap-2'>
          {tasks.map((task) => (
            <TaskListItem key={task.id} task={task} onToggleDone={toggleTaskDone} onDelete={deleteTask} />
          ))}
        </ul>
      )}
    </div>
  );
}
