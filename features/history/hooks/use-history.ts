import { useCallback, useEffect, useMemo, useState } from 'react';
import type { HistoryItem } from '../types/history-item';
import { historyRepo } from '../services/history-repo';

export function useHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const next = await historyRepo.list();
      setItems(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load history');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await historyRepo.remove(id);
    await refresh();
  }, [refresh]);

  const clear = useCallback(async () => {
    await historyRepo.clear();
    await refresh();
  }, [refresh]);

  return useMemo(
    () => ({
      items,
      isLoading,
      error,
      refresh,
      remove,
      clear,
    }),
    [items, isLoading, error, refresh, remove, clear],
  );
}

