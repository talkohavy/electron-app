import { useCallback } from 'react';
import { showInfoToast } from '@renderer/common/utils/toast';
import { useDarkTheme } from '@renderer/providers/DarkThemeProvider';

export function useThemeToggleHandler() {
  const { toggleDarkMode } = useDarkTheme();

  const handleToggleTheme = useCallback(() => {
    const nowDark = toggleDarkMode();

    showInfoToast({ title: `${nowDark ? 'Dark' : 'Light'} mode` });
  }, [toggleDarkMode]);

  return { handleToggleTheme };
}
