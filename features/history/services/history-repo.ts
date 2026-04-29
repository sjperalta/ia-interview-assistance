import AsyncStorage from '@react-native-async-storage/async-storage';
import type { HistoryItem } from '../types/history-item';

const HISTORY_KEY = 'history:v1';

type HistoryPayload = {
  items: HistoryItem[];
};

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export const historyRepo = {
  async list(): Promise<HistoryItem[]> {
    try {
      const raw = await AsyncStorage.getItem(HISTORY_KEY);
      const parsed = safeJsonParse<HistoryPayload>(raw);
      return parsed?.items ?? [];
    } catch {
      return [];
    }
  },

  async add(item: HistoryItem): Promise<void> {
    try {
      const existing = await historyRepo.list();
      const items = [item, ...existing].slice(0, 200);
      const payload: HistoryPayload = { items };
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(payload));
    } catch {
      // no-op when storage unavailable
    }
  },

  async remove(id: string): Promise<void> {
    try {
      const existing = await historyRepo.list();
      const items = existing.filter((x) => x.id !== id);
      const payload: HistoryPayload = { items };
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(payload));
    } catch {
      // no-op when storage unavailable
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(HISTORY_KEY);
    } catch {
      // no-op when storage unavailable
    }
  },
};

