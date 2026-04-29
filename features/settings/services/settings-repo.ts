import * as SecureStore from 'expo-secure-store';
import { defaultSettings, type AnswerStyle, type AppSettings } from '../types/settings';

const SETTINGS_KEY = 'settings:v1';

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

const ALLOWED_VAD_SILENCE_MS = [800, 1000, 1200] as const;
const ALLOWED_ANSWER_STYLES: readonly AnswerStyle[] = ['concise', 'slightly_detailed'] as const;

function normalizeSettings(input: Partial<AppSettings> | null | undefined): AppSettings {
  const candidate = { ...defaultSettings, ...(input ?? {}) } as AppSettings;

  const whisperModeDefault = typeof candidate.whisperModeDefault === 'boolean'
    ? candidate.whisperModeDefault
    : defaultSettings.whisperModeDefault;

  const vadSilenceMs =
    typeof candidate.vadSilenceMs === 'number' && ALLOWED_VAD_SILENCE_MS.includes(candidate.vadSilenceMs as any)
      ? candidate.vadSilenceMs
      : defaultSettings.vadSilenceMs;

  const answerStyle = ALLOWED_ANSWER_STYLES.includes(candidate.answerStyle)
    ? candidate.answerStyle
    : defaultSettings.answerStyle;

  return { whisperModeDefault, vadSilenceMs, answerStyle };
}

export const settingsRepo = {
  async get(): Promise<AppSettings> {
    try {
      const raw = await SecureStore.getItemAsync(SETTINGS_KEY);
      const parsed = safeJsonParse<AppSettings>(raw);
      return normalizeSettings(parsed);
    } catch {
      // If the native module isn't available yet (e.g. dev client needs rebuild),
      // fall back to defaults rather than crashing the app.
      return normalizeSettings(null);
    }
  },

  async set(next: AppSettings): Promise<void> {
    try {
      await SecureStore.setItemAsync(SETTINGS_KEY, JSON.stringify(normalizeSettings(next)));
    } catch {
      // no-op when storage unavailable
    }
  },

  async reset(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(SETTINGS_KEY);
    } catch {
      // no-op when storage unavailable
    }
  },
};

