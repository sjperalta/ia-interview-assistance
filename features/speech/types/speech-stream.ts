export type SpeechPartialMeta = {
  /** Deepgram alternative confidence, typically 0–1 when present */
  confidence: number | null;
};

export type SpeechStreamEventHandlers = {
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onPartial?: (text: string, meta?: SpeechPartialMeta) => void;
  onFinal?: (text: string) => void;
  onError?: (error: Error) => void;
};

export type SpeechStreamStartOptions = {
  vadSilenceMs: number;
  chunkMs: number;
};

export interface SpeechStream {
  start: (handlers: SpeechStreamEventHandlers, options: SpeechStreamStartOptions) => Promise<void>;
  stop: () => Promise<void>;
}

