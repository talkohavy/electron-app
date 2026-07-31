import { useEffect, useState } from 'react';
import {
  DANGER_BUTTON_CLASS_NAME,
  FIELD_CLASS_NAME,
  LABEL_CLASS_NAME,
  PRIMARY_BUTTON_CLASS_NAME,
} from '@renderer/common/constants';
import { useTaskCategories } from '@renderer/hooks/useTaskCategories';
import { TaskPriorities } from '@root/common/constants';
import type { TaskPriorityValues } from '@root/common/constants';
import type { Task, UpdateTaskInput } from '@root/common/types';

type TaskEditFormProps = {
  task: Task;
  isSaving: boolean;
  onSave: (patch: UpdateTaskInput) => void;
  onDelete: () => void;
};

export default function TaskEditForm(props: TaskEditFormProps): React.JSX.Element {
  const { task, isSaving, onSave, onDelete } = props;

  const categories = useTaskCategories();

  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes);
  const [priority, setPriority] = useState<TaskPriorityValues>(task.priority);
  const [categoryId, setCategoryId] = useState(task.categoryId ? String(task.categoryId) : '');
  const [isDone, setIsDone] = useState(task.isDone);

  /**
   * Re-seed the fields whenever the stored row changes, so a write from elsewhere is
   * reflected here rather than being silently overwritten by this form's stale values.
   */
  useEffect(() => {
    setTitle(task.title);
    setNotes(task.notes);
    setPriority(task.priority);
    setCategoryId(task.categoryId ? String(task.categoryId) : '');
    setIsDone(task.isDone);
  }, [task]);

  const onFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSave({ title, notes, priority, isDone, categoryId: categoryId ? Number(categoryId) : null });
  };

  return (
    <form
      onSubmit={onFormSubmit}
      className='flex w-full flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800'
    >
      <label className='flex flex-col gap-1'>
        <span className={LABEL_CLASS_NAME}>title</span>

        <input value={title} onChange={(event) => setTitle(event.target.value)} className={FIELD_CLASS_NAME} />
      </label>

      <label className='flex flex-col gap-1'>
        <span className={LABEL_CLASS_NAME}>notes</span>

        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={4}
          placeholder='Nothing here yet'
          className={`${FIELD_CLASS_NAME} resize-none`}
        />
      </label>

      <div className='flex flex-wrap gap-3'>
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
      </div>

      <label className='flex w-fit cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-200'>
        <input
          type='checkbox'
          checked={isDone}
          onChange={(event) => setIsDone(event.target.checked)}
          className='size-4 cursor-pointer accent-blue-500'
        />
        Done
      </label>

      <div className='flex items-center gap-3'>
        <button type='submit' disabled={isSaving} className={PRIMARY_BUTTON_CLASS_NAME}>
          {isSaving ? 'Saving...' : 'Save changes'}
        </button>

        <button type='button' onClick={onDelete} className={DANGER_BUTTON_CLASS_NAME}>
          Delete row
        </button>
      </div>
    </form>
  );
}
