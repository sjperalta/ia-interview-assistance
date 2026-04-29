## 1. Telemetry and persistence

- [x] 1.1 Add `insights-telemetry-repo` (AsyncStorage) for `totalSessions` and `totalPracticeSeconds` (or equivalent)
- [x] 1.2 Update `use-interview` `stopListening` to append `sessionDuration` to practice total and increment session count per design gates

## 2. History and confidence (optional but recommended)

- [x] 2.1 Extend `HistoryItem` with optional `sttConfidence?: number` (or rename per codebase conventions)
- [x] 2.2 When saving history after a successful answer, pass through last known STT confidence from the interview flow if available

## 3. Aggregation service + hook

- [x] 3.1 Add `build-insights-data` (pure) in `features/insights/services/` combining `historyRepo.list()` + telemetry → `InsightsData`
- [x] 3.2 Replace mock in `use-insights.ts` with async load + refresh strategy (focus effect or subscription pattern)

## 4. Skill heuristics

- [x] 4.1 Implement Phase 1 heuristic `SkillScore[]` from Q&A text (document weights in code comments briefly)
- [x] 4.2 Handle empty history baseline in UI or builder

## 5. UX polish

- [x] 5.1 Format `practiceTime` for display (hours/minutes)
- [x] 5.2 Wire Settings icon on Insights header to `/settings` if not already
- [x] 5.3 Add optional “Estimated from your practice” copy under Skill Breakdown

## 6. Verification

- [ ] 6.1 Manual: empty install → Insights shows zeros/neutral without crash
- [ ] 6.2 Manual: complete one live session + one answer → questions count and practice time increase
- [ ] 6.3 Manual: reset app data → Insights stats return to baseline
