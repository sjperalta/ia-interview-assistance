export type AnswerStyle = 'concise' | 'slightly_detailed';

export type AppSettings = {
  whisperModeDefault: boolean;
  vadSilenceMs: number;
  answerStyle: AnswerStyle;
};

export const defaultSettings: AppSettings = {
  whisperModeDefault: false,
  vadSilenceMs: 1000,
  answerStyle: 'concise',
};

