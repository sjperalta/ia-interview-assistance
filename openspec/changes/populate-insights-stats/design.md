## Context

- **UI**: `InsightsScreen` + `StatCard` + `SkillBreakdown` expect `InsightsData` (`InsightStats` + `SkillScore[]`).
- **Today**: `use-insights.ts` mocks fixed numbers after 500ms.
- **Available data**: `historyRepo.list()` → `HistoryItem[]` (`question`, `answerBullets`, `createdAt`, optional `providerMeta.latencyMs`). No row-level confidence or session id today.
- **Live session**: `use-interview` tracks `sessionDuration` (seconds while not Idle) and `confidence` in UI state, but **confidence stays 0** unless wired from STT; duration is **reset on stop**, not accumulated globally.

## Goals / Non-Goals

**Goals:**

- Fill the four stat cards from **real local data** where possible.
- Keep implementation **offline-first** and consistent with feature-first layout (`features/insights`).
- Document how each number is computed so UX is trustworthy.

**Non-Goals (Phase 1):**

- Server-side analytics, cohorts, or cross-device sync.
- LLM-based “true” skill assessment (can be a later phase).
- Perfect psychometric validity for skill scores.

## Decisions

### 1) Questions answered

- **Definition**: Count of saved history items: `historyRepo.list().length` (capped list already at 200 in repo).
- **Rationale**: Matches “each generated answer we stored.”

### 2) Total sessions

- **Definition (recommended)**: Increment a **local counter** in AsyncStorage whenever the user **stops** a live session (`stopListening`) **and** `sessionDuration > 0` (or at least one debug/listening cycle), to avoid counting idle opens.
- **Alternative**: “Distinct calendar days with ≥1 history item” — simpler but conflates sessions with days.
- **Rationale**: Product label is “Total Sessions”; explicit counter matches user mental model.

### 3) Practice time

- **Definition (recommended)**: Persist **cumulative practice seconds** in AsyncStorage; on each `stopListening`, add `sessionDuration` to the running total; format as `xh` / `xm` for the card (e.g. `12.5h` or `45m`).
- **Rationale**: History timestamps do not record continuous mic-on time; session timer already exists.

### 4) Average confidence

- **Problem**: History does not store confidence; STT confidence exists in `DeepgramChunkSpeechStream` but is not propagated to history.
- **Phase 1 options (pick one in implementation):**
  - **A (recommended)**: Add optional `sttConfidence?: number` on `HistoryItem` when saving; Insights averages over items that have it. Card shows `—` or `0%` when none.
  - **B**: Hide “Avg Confidence” or rename until data exists.
- **Rationale**: Avoid fake percentages; wire real signal when available.

### 5) Skill breakdown (Phase 1)

- **Approach**: **Heuristic scores 0–100** derived from local history, e.g.:

  - **Communication**: average answer bullet length / structure (e.g. presence of examples, not too terse).
  - **Technical Knowledge**: keyword density or simple taxonomy match in Q&A (tunable stub).
  - **Problem Solving**: question types (“how would you…”, “design…”) vs answer length.
  - **Confidence**: map from average `sttConfidence` when present, else mild default from answer consistency.

- **UX honesty**: Consider a subtitle “Estimated from your practice” under Skill Breakdown (optional string in UI).

- **Rationale**: Ships value without extra API cost; can swap for LLM or manual rubric later.

### 6) Architecture

- Add `features/insights/services/build-insights-data.ts` (pure functions: `HistoryItem[]` + telemetry → `InsightsData`) to keep hook thin.
- Add `features/insights/services/insights-telemetry-repo.ts` (or under `history`) for `{ totalSessions, totalPracticeSeconds }` in AsyncStorage.
- Export only what other features need via `features/insights/index.ts` per AGENTS.md.

## Risks / Trade-offs

- **Heuristic skills feel arbitrary** → Mitigate with copy (“estimated”) and iterate.
- **Session counter edge cases** (crash mid-session) → Acceptable; counter increments on explicit stop.
- **avgConfidence sparse** → Until STT confidence is stored, average may be empty; prefer **A** above.

## Open Questions

- Should “Total Sessions” include only sessions with ≥1 answered question? (Recommended: yes — gate increment on `sessionDuration > 0` and optionally `suggestedAnswer` ever non-empty, or count only stops after at least one `historyRepo.add`.)
