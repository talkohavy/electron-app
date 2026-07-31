import { TaskPriorities } from '@root/common/constants';
import clsx from 'clsx';
import type { TaskPriorityValues } from '@root/common/constants';

const PRIORITY_CLASSES: Record<TaskPriorityValues, string> = {
  [TaskPriorities.Low]: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  [TaskPriorities.Medium]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  [TaskPriorities.High]: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
};

type PriorityBadgeProps = {
  priority: TaskPriorityValues;
  className?: string;
};

export default function PriorityBadge(props: PriorityBadgeProps) {
  const { priority, className } = props;

  return (
    <span
      className={clsx(
        'rounded-full px-2 py-0.5 text-xs font-semibold capitalize',
        PRIORITY_CLASSES[priority],
        className,
      )}
    >
      {priority}
    </span>
  );
}
