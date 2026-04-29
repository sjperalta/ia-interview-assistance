## 1. STT accuracy and stability tuning

- [x] 1.1 Centralize Deepgram `/v1/listen` URL building (model + params) in `features/speech/services/deepgram-chunk-stream.ts`
- [x] 1.2 Update Deepgram model/params for accuracy (e.g., `model=nova-3`, `smart_format`, `punctuate`, `numerals`, `utterances`)
- [x] 1.3 Serialize chunk flush to prevent overlapping stop/start races in the recorder
- [x] 1.4 Update Live Session default `chunkMs` to 4000ms in `features/interview/hooks/use-interview.ts`

## 2. Auto-finalize question during live listening

- [x] 2.1 Extract a single "handleFinalQuestion" flow so manual finalization and auto-finalization share the same logic
- [x] 2.2 Implement auto-finalize heuristic on partial transcript (minimum length + ends with `?` + `isLikelyQuestion`)
- [x] 2.3 Add de-dup guard to avoid repeated answer generation for identical stabilized partials
- [x] 2.4 Ensure the system returns to listening after generating an answer (no session stop required)

## 3. Verification and regression checks

- [x] 3.1 Run lint/typecheck for the updated files and resolve issues (timer types, async flow, hooks deps)
- [x] 3.2 Manual test: start live session, speak a question ending with `?`, verify auto-answer without pressing Stop
- [x] 3.3 Manual test: speak non-question phrases, verify no auto-finalize and session continues listening
- [x] 3.4 Manual test: repeat the same question / stable partial updates, verify answer is generated once (no duplicates)

