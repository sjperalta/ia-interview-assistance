## Why

Live sessions can trigger unnecessary LLM calls (short/partial transcripts, repeated variants, or rapid re-triggers), wasting tokens and increasing latency/cost. We want predictable guardrails that reduce calls while preserving the “hands-free” UX.

## What Changes

- Add explicit LLM call gating for interview answers: minimum question length, cooldown, and normalized de-duplication.
- Ensure prompts sent to DeepSeek remain minimal and exclude UI/debug state.
- When silence-based finalization occurs, evaluate whether the finalized transcript is “question-worthy” and only then trigger the LLM.

## Capabilities

### New Capabilities
- `interview-llm-call-guardrails`: Prevent redundant or low-signal LLM calls using minimum length, cooldown, and normalized de-duplication rules.
- `interview-prompt-minimization`: Define and enforce that only the finalized question and minimal formatting rules are included in prompts (no UI/debug payload).
- `interview-silence-finalize-evaluation`: On silence-based finalization, decide whether to treat the utterance as a question and trigger answer generation.

### Modified Capabilities
- (none)

## Impact

- Affected code:
  - `services/deepseek/deepseek-client.ts` (guardrails and prompt construction)
  - `features/interview/hooks/use-interview.ts` (when to call the LLM on finalization events)
  - `features/speech/services/deepgram-chunk-stream.ts` (silence finalization is already present; behavior clarified via specs)
- UX: fewer “random” answers and less repeated answering; potentially small delays due to cooldown.
