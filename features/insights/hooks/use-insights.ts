import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { historyRepo } from '#root/features/history';
import { InsightsData } from '../types';
import { buildInsightsData } from '../services/build-insights-data';
import { insightsTelemetryRepo } from '../services/insights-telemetry-repo';

export function useInsights() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const [items, telemetry] = await Promise.all([historyRepo.list(), insightsTelemetryRepo.get()]);
      setData(buildInsightsData(items, telemetry));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return { data, isLoading, refresh };
}
