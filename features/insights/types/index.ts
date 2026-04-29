export interface InsightStats {
  totalSessions: number;
  /** Average STT confidence as 0–100 when any history row has `sttConfidence`; otherwise null (UI shows em dash). */
  avgConfidence: number | null;
  questionsAnswered: number;
  practiceTime: string;
}

export interface SkillScore {
  name: string;
  score: number;
}

export interface InsightsData {
  stats: InsightStats;
  skills: SkillScore[];
}
