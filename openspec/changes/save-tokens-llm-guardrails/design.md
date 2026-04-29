## Context

The live interview flow transcribes speech and calls DeepSeek to generate answer bullets. Without strict gating, short partial transcripts and repeated variants can trigger redundant LLM calls, increasing token spend and adding latency. The codebase already contains some client-side suppression (rate limit + duplicate suppression) inside `services/deepseek/deepseek-client.ts`, but the behavior is implicit and not aligned with the desired session-level rules (min length, cooldown, normalized dedupe, and silence-finalize evaluation).

## Goals / Non-Goals

**Goals:**
- Ensure the system only calls the LLM for high-signal questions by enforcing:
  - minimum length (default 10 chars)
  - cooldown window (default 5s)
  - normalized question de-duplication
- Keep LLM prompts minimal: include only the finalized question and minimal formatting constraints (no UI/debug context).
- When silence-based finalization occurs, evaluate “is this a question?” before considering an LLM call.

**Non-Goals:**
- Server-side token accounting, billing dashboards, or analytics.
- Switching to a different LLM provider or adding RAG/context memory.
- Deepgram/STT architectural changes (streaming vs chunking) beyond leveraging existing silence-finalization signals.

## Decisions

- **Where guardrails live**
  - Enforce *session-level* gating in `features/interview/hooks/use-interview.ts` (min length + question-likeness + silence-finalize evaluation) to avoid even attempting calls for low-signal utterances.
  - Keep *provider-level* suppression in `services/deepseek/deepseek-client.ts` (cooldown + normalized de-dup), so any caller benefits and accidental double-calls are prevented.

- **Normalization algorithm**
  - Use a deterministic normalization: `trim -> lowercase -> collapse whitespace -> slice(0, N)`.
  - Rationale: fast, stable, and good enough to catch variants like extra spaces/casing.

- **Cooldown semantics**
  - Cooldown applies per-device/session and blocks repeat calls even for slightly different questions in rapid succession.
  - Rationale: token spend is mostly driven by rapid repeated triggers; a small cooldown (5s) is usually imperceptible to users.

- **Prompt minimization**
  - Keep system message short and stable, and user message limited to the question plus strict output constraints.
  - Rationale: every extra line costs tokens; UI/debug strings do not improve answer quality.

- **Silence-finalize evaluation**
  - Treat silence-finalized `onFinal` events as candidates; only call LLM if `isLikelyQuestion()` and guardrails pass.
  - Rationale: silence finalization is common; it must not cause non-question utterances to trigger expensive calls.

## Risks / Trade-offs

- **[Risk] Missed questions due to min length** → **Mitigation**: keep default low (10 chars) and apply to *finalized* text, not partials.
- **[Risk] Cooldown suppresses a real follow-up question** → **Mitigation**: keep cooldown small (5s) and only apply to LLM calls; transcription continues.
- **[Risk] Normalization causes false dedupe** → **Mitigation**: include a max length and require exact normalized match; revisit if collisions appear.
- **[Trade-off] Some extra logic split across hook + service** → **Mitigation**: define a single helper function and shared constants for defaults.

