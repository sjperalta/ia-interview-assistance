import AsyncStorage from '@react-native-async-storage/async-storage';

const TELEMETRY_KEY = 'insights:telemetry:v1';

export type InsightsTelemetry = {
  totalSessions: number;
  totalPracticeSeconds: number;
};

const DEFAULT_TELEMETRY: InsightsTelemetry = {
  totalSessions: 0,
  totalPracticeSeconds: 0,
};

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function normalize(raw: Partial<InsightsTelemetry> | null | undefined): InsightsTelemetry {
  const sessions = raw?.totalSessions;
  const seconds = raw?.totalPracticeSeconds;
  return {
    totalSessions: typeof sessions === 'number' && sessions >= 0 ? Math.floor(sessions) : 0,
    totalPracticeSeconds:
      typeof seconds === 'number' && seconds >= 0 ? Math.floor(seconds) : 0,
  };
}

export const insightsTelemetryRepo = {
  async get(): Promise<InsightsTelemetry> {
    try {
      const raw = await AsyncStorage.getItem(TELEMETRY_KEY);
      const parsed = safeJsonParse<Partial<InsightsTelemetry>>(raw);
      return normalize(parsed);
    } catch {
      return { ...DEFAULT_TELEMETRY };
    }
  },

  async set(next: InsightsTelemetry): Promise<void> {
    try {
      await AsyncStorage.setItem(TELEMETRY_KEY, JSON.stringify(normalize(next)));
    } catch {
      // no-op
    }
  },

  /**
   * Call when the user stops a live session after meaningful practice time.
   */
  async recordSessionEnd(sessionDurationSeconds: number): Promise<void> {
    if (sessionDurationSeconds <= 0) return;
    const current = await this.get();
    await this.set({
      totalSessions: current.totalSessions + 1,
      totalPracticeSeconds: current.totalPracticeSeconds + sessionDurationSeconds,
    });
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TELEMETRY_KEY);
    } catch {
      // no-op
    }
  },
};
