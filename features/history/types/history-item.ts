export type HistoryAnswerStyle = 'concise' | 'slightly_detailed';

export type HistoryItem = {
  id: string;
  question: string;
  answerBullets: string[];
  createdAt: string; // ISO
  /** Last known STT confidence for this question (0–1) when available */
  sttConfidence?: number;
  providerMeta?: {
    deepseekModel?: string;
    latencyMs?: number;
  };
};

