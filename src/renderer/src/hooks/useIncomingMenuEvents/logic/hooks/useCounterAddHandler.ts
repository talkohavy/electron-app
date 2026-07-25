import { useCallback } from 'react';
import { showInfoToast } from '@renderer/common/utils/toast';
import { ipcClient } from '@renderer/lib/ipc';
import type { CounterAddPayload } from '@root/common/types';

export function useCounterAddHandler() {
  const handleCounterAdd = useCallback(
    (payload: CounterAddPayload) => {
      ipcClient.counter.increment(payload.delta);

      showInfoToast({ title: `Counter ${payload.delta > 0 ? '+' : ''}${payload.delta}` });
    },
    [ipcClient.counter],
  );

  return { handleCounterAdd };
}
