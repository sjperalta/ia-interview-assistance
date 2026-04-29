## 1. LLM guardrails (min length, cooldown, dedupe)

- [x] 1.1 Add minimum length gating (default 10 chars) before calling `generateInterviewAnswer` in `features/interview/hooks/use-interview.ts`
- [x] 1.2 Centralize question normalization helper (trim/lowercase/collapse whitespace/slice) and reuse it for dedupe
- [x] 1.3 Implement cooldown gating (default 5s) for LLM calls (session-level and/or provider-level)
- [x] 1.4 Ensure duplicate normalized questions are suppressed (do not call LLM)

## 2. Prompt minimization

- [x] 2.1 Audit prompt construction in `services/deepseek/deepseek-client.ts` to ensure only finalized question + minimal formatting constraints are sent
- [x] 2.2 Remove any accidental inclusion of UI/debug state in the prompt payloads (if present)

## 3. Silence-finalize evaluation

- [x] 3.1 Ensure `onFinal` (silence-finalized) paths evaluate `isLikelyQuestion()` before any LLM call attempt
- [x] 3.2 Ensure auto-finalize paths respect the same guardrails (min length, cooldown, dedupe)

## 4. Verification

- [x] 4.1 Unit-level sanity check: verify normalization/dedupe/cooldown logic suppresses duplicates and rapid calls
- [x] 4.2 Manual test: speak a short utterance (<10 chars), verify no LLM call and listening continues
- [x] 4.3 Manual test: ask the same question twice within 5s, verify the second call is suppressed
- [x] 4.4 Manual test: ask two different questions within 5s, verify cooldown behavior matches spec (suppressed or allowed based on chosen semantics)

