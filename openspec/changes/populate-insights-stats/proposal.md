## Why

The Insights tab UI is complete but `use-insights` only returns hard-coded mock data after a timeout. Users expect numbers that reflect real usage. The app already persists **Q&A history** locally (`historyRepo`) and runs **live interview sessions** with a session timer, but that data is not aggregated for Insights.

## What Changes

- Replace mock `use-insights` with **derived and/or persisted aggregates** from local storage.
- Define clear rules for each stat: **questions answered**, **practice time**, **session count**, **average confidence** (when data exists).
- Provide a **skill breakdown** that is honest about its source: Phase 1 uses **deterministic heuristics** from history text (or a minimal placeholder) until richer signals exist.
- Optionally extend persisted models (`HistoryItem`, small **insights telemetry** key in AsyncStorage) so stats stay accurate across restarts.

## Capabilities

### New Capabilities

- `insights-stats-aggregation`: Compute and expose `InsightStats` (total sessions, avg confidence, questions answered, practice time) from local data.
- `insights-skill-breakdown`: Compute and expose `SkillScore[]` for the Skill Breakdown UI using an explicit, documented method (heuristics in Phase 1).

### Modified Capabilities

- (none)

## Impact

- `features/insights/hooks/use-insights.ts`, `features/insights/types/index.ts`
- `features/history/` (optional: extra fields on `HistoryItem`, or new `insights-repo` / telemetry helpers)
- `features/interview/hooks/use-interview.ts` (optional: persist session seconds, session increments, confidence on save)
- No new backend required for Phase 1; all local-first.
