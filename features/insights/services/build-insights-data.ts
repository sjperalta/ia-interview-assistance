import type { HistoryItem } from '#root/features/history/types/history-item';
import type { InsightsData, InsightStats, SkillScore } from '../types';
import type { InsightsTelemetry } from './insights-telemetry-repo';

/** Format cumulative practice seconds for stat cards (e.g. 45m, 12.5h, 30s). */
export function formatPracticeTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  if (s < 60) return `${s}s`;
  const hours = s / 3600;
  if (hours >= 1) return `${hours.toFixed(1)}h`;
  const mins = Math.floor(s / 60);
  return `${mins}m`;
}

/**
 * Phase 1 skill scores: deterministic heuristics over Q&A text.
 * - Communication: answer length / structure (bullets with enough words).
 * - Technical: tech-ish terms in Q or A.
 * - Problem solving: design/tradeoff/how-would-you patterns.
 * - Confidence: maps from average STT confidence when present, else a mild default from answer consistency.
 */
export function buildSkillScores(items: HistoryItem[], avgStt01: number | null): SkillScore[] {
  if (items.length === 0) {
    return [
      { name: 'Technical Knowledge', score: 50 },
      { name: 'Communication', score: 50 },
      { name: 'Problem Solving', score: 50 },
      { name: 'Confidence', score: 50 },
    ];
  }

  let commSum = 0;
  let techHits = 0;
  let probHits = 0;
  let bulletWordCounts: number[] = [];

  const techRe =
    /\b(api|sql|react|node|typescript|cache|latency|scal(e|ing)|database|kubernetes|docker|oauth|jwt|graphql|microservice)\b/gi;
  const probRe =
    /\b(how would you|trade-?off|design|architect|scale|debug|incident|root cause|estimate|prioritize)\b/gi;

  for (const it of items) {
    const q = it.question;
    const a = it.answerBullets.join(' ');
    const combined = `${q} ${a}`;

    const techMatches = combined.match(techRe);
    techHits += techMatches ? techMatches.length : 0;

    const probMatches = combined.match(probRe);
    probHits += probMatches ? probMatches.length : 0;

    for (const b of it.answerBullets) {
      const words = b.trim().split(/\s+/).filter(Boolean).length;
      bulletWordCounts.push(words);
      // Communication: reward bullets that are substantive but not huge walls
      const comm = Math.min(100, Math.max(40, 50 + Math.min(30, words - 8)));
      commSum += comm;
    }
  }

  const communicationScoreAvg = bulletWordCounts.length ? commSum / bulletWordCounts.length : 50;
  const technical = Math.min(100, Math.round(55 + Math.min(40, techHits * 6)));
  const problemSolving = Math.min(100, Math.round(52 + Math.min(45, probHits * 8)));

  const avgBulletWords = bulletWordCounts.length
    ? bulletWordCounts.reduce((a, b) => a + b, 0) / bulletWordCounts.length
    : 0;
  const wordVariance =
    bulletWordCounts.length > 1
      ? bulletWordCounts.reduce((acc, w) => acc + Math.abs(w - avgBulletWords), 0) / bulletWordCounts.length
      : 0;
  const communication = Math.min(100, Math.round(communicationScoreAvg + Math.min(15, wordVariance)));

  let confidenceScore: number;
  if (avgStt01 != null && !Number.isNaN(avgStt01)) {
    confidenceScore = Math.round(Math.min(100, Math.max(0, avgStt01 * 100)));
  } else {
    confidenceScore = Math.min(100, Math.round(48 + Math.min(25, items.length * 2)));
  }

  return [
    { name: 'Technical Knowledge', score: technical },
    { name: 'Communication', score: communication },
    { name: 'Problem Solving', score: problemSolving },
    { name: 'Confidence', score: confidenceScore },
  ];
}

export function buildInsightsData(items: HistoryItem[], telemetry: InsightsTelemetry): InsightsData {
  const confidences = items
    .map((i) => i.sttConfidence)
    .filter((c): c is number => typeof c === 'number' && !Number.isNaN(c));
  const avgStt01 = confidences.length ? confidences.reduce((a, b) => a + b, 0) / confidences.length : null;

  const stats: InsightStats = {
    totalSessions: telemetry.totalSessions,
    avgConfidence: avgStt01 != null ? Math.round(avgStt01 * 100) : null,
    questionsAnswered: items.length,
    practiceTime: formatPracticeTime(telemetry.totalPracticeSeconds),
  };

  const skills = buildSkillScores(items, avgStt01);

  return { stats, skills };
}
