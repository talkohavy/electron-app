import { TaskPriorities } from '@root/common/constants';
import type { TaskStats } from '@root/common/types';

type TaskStatsBarProps = {
  stats: TaskStats | null;
};

/**
 * Every number here comes from one aggregate query, not from counting `tasks` in JS -
 * the point being that `COUNT`/`SUM` describe the whole table, while the list above is
 * only the filtered page of it.
 */
export default function TaskStatsBar(props: TaskStatsBarProps): React.JSX.Element {
  const { stats } = props;

  const cells = [
    { label: 'rows', value: stats?.total ?? 0 },
    { label: 'open', value: stats?.open ?? 0 },
    { label: 'done', value: stats?.done ?? 0 },
    { label: 'high', value: stats?.byPriority[TaskPriorities.High] ?? 0 },
  ];

  return (
    <dl className='grid w-full grid-cols-4 gap-3'>
      {cells.map(({ label, value }) => (
        <div
          key={label}
          className='rounded-xl border border-gray-200 bg-white px-4 py-3 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800'
        >
          <dt className='text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500'>{label}</dt>

          <dd className='font-mono text-2xl font-extrabold text-gray-900 dark:text-white'>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
