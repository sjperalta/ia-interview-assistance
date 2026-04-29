import { useCallback, useEffect, useMemo, useState } from 'react';
import { settingsRepo } from '../services/settings-repo';
import type { AppSettings } from '../types/settings';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const next = await settingsRepo.get();
      setSettings(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const update = useCallback(async (patch: Partial<AppSettings>) => {
    const current = settings ?? (await settingsRepo.get());
    const next = { ...current, ...patch };
    await settingsRepo.set(next);
    setSettings(next);
  }, [settings]);

  const reset = useCallback(async () => {
    await settingsRepo.reset();
    await refresh();
  }, [refresh]);

  return useMemo(
    () => ({
      settings,
      isLoading,
      error,
      refresh,
      update,
      reset,
    }),
    [settings, isLoading, error, refresh, update, reset],
  );
}

