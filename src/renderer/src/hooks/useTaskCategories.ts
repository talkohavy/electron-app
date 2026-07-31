import { useEffect, useState } from 'react';
import { ipcClient } from '@renderer/lib/ipc';
import type { TaskCategory } from '@root/common/types';

/**
 * The `categories` table, loaded once per mount. Seeded by a migration and never edited
 * by this demo, so there is nothing to invalidate.
 */
export function useTaskCategories(): Array<TaskCategory> {
  const [categories, setCategories] = useState<Array<TaskCategory>>([]);

  useEffect(() => {
    ipcClient.tasks.listCategories().then(setCategories);
  }, []);

  return categories;
}
