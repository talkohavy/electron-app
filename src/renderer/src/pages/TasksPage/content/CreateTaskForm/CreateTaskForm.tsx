import { useState } from 'react';
import { FIELD_CLASS_NAME, LABEL_CLASS_NAME, PRIMARY_BUTTON_CLASS_NAME } from '@renderer/common/constants';
import { useTaskCategories } from '@renderer/hooks/useTaskCategories';
import { TaskPriorities } from '@root/common/constants';
import type { TaskPriorityValues } from '@root/common/constants';
import type { CreateTaskInput } from '@root/common/types';

type CreateTaskFormProps = {
  onSubmit: (input: CreateTaskInput) => Promise<boolean>;
};

export default function CreateTaskForm(props: CreateTaskFormProps): React.JSX.Element {
  const { onSubmit } = props;

  const categories = useTaskCategories();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<TaskPriorityValues>(TaskPriorities.Medium);
  const [categoryId, setCategoryId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);

    const wasCreated = await onSubmit({
      title,
      notes,
      priority,
      categoryId: categoryId ? Number(categoryId) : null,
    });

    setIsSubmitting(false);

    // Keep the typed values on failure so the message can be acted on without retyping.
    if (!wasCreated) return;

    setTitle('');
    setNotes('');
  };

  return (
    <form
      onSubmit={onFormSubmit}
      className='flex w-full flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800'
    >
      <div className='flex flex-col gap-1'>
        <h2 className='font-mono text-sm font-semibold text-gray-900 dark:text-white'>INSERT INTO tasks</h2>

        <p className='text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500'>create</p>
      </div>

      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder='What needs doing?'
        className={FIELD_CLASS_NAME}
      />

      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder='Notes (optional)'
        rows={2}
        className={`${FIELD_CLASS_NAME} resize-none`}
      />

      <div className='flex flex-wrap items-end gap-3'>
        <label className='flex flex-1 flex-col gap-1'>
          <span className={LABEL_CLASS_NAME}>priority</span>

          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as TaskPriorityValues)}
            className={FIELD_CLASS_NAME}
          >
            {Object.values(TaskPriorities).map((priorityOption) => (
              <option key={priorityOption} value={priorityOption}>
                {priorityOption}
              </option>
            ))}
          </select>
        </label>

        <label className='flex flex-1 flex-col gap-1'>
          <span className={LABEL_CLASS_NAME}>category</span>

          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className={FIELD_CLASS_NAME}
          >
            <option value=''>none</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <button type='submit' disabled={isSubmitting} className={PRIMARY_BUTTON_CLASS_NAME}>
          Add task
        </button>
      </div>
    </form>
  );
}
