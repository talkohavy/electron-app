import clsx from 'clsx';

type CategoryChipProps = {
  name: string | null;
  color: string | null;
  className?: string;
};

/**
 * Renders the LEFT JOINed category. `null` means the task has no category - either it
 * never had one, or `ON DELETE SET NULL` cleared it when the category was removed.
 */
export default function CategoryChip(props: CategoryChipProps) {
  const { name, color, className } = props;

  if (!name) {
    return <span className={clsx('text-xs italic text-gray-400 dark:text-gray-500', className)}>no category</span>;
  }

  return (
    <span className={clsx('inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300', className)}>
      <span className='size-2 shrink-0 rounded-full' style={{ backgroundColor: color ?? 'transparent' }} />
      {name}
    </span>
  );
}
