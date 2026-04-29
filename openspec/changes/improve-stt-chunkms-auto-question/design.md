## Context

Today the app performs speech-to-text by recording audio chunks on-device and posting each chunk to Deepgram `/v1/listen`. With short chunks and frequent stop/start, transcripts often miss words at boundaries and users must manually stop listening to "submit" a question.

Constraints:
- Expo/React Native environment using `expo-av` for recording.
- Current STT implementation is chunk-based (not realtime websocket streaming).
- Live Session UX should remain hands-free; Stop should be reserved for ending the session, not for triggering question processing.

## Goals / Non-Goals

**Goals:**
- Improve STT accuracy by tuning chunk defaults (target: 4000ms) and Deepgram `/v1/listen` parameters/model.
- Auto-finalize and process questions during active listening when the transcript indicates a complete question.
- Prevent duplicate triggers from repeated partial updates.
- Keep the session running after processing a question (continue listening).

**Non-Goals:**
- Implement Deepgram realtime (WebSocket) streaming STT.
- Add full VAD/endpointing beyond existing silence-based finalization and simple heuristics.
- Add multi-speaker diarization UX or transcript timelines.

## Decisions

- **Chunk interval default: 4000ms**
  - **Why**: 2.5s chunks are often too short for stable recognition and punctuation; 5s increases perceived lag. 4s is a pragmatic middle ground.
  - **Alternatives**:
    - 2500ms: lower latency but poorer accuracy and more boundary clipping.
    - 5000ms+: better context but sluggish and can delay answers.

- **Deepgram `/v1/listen` parameters tuned for accuracy/readability**
  - Use `model=nova-3` and enable formatting flags (`smart_format`, `punctuate`, `numerals`) plus `utterances`.
  - **Why**: Nova models and formatting options produce higher quality text that improves downstream question detection and answer generation quality.
  - **Alternatives**:
    - Keep existing defaults: minimal improvements.
    - Switch to websocket streaming: best UX, but higher scope.

- **Auto-finalize heuristic based on transcript completeness**
  - Trigger auto-finalization when partial transcript ends with `?` and meets minimum length, and passes existing `isLikelyQuestion()` predicate.
  - **Why**: This is simple, safe, and leverages punctuation from `smart_format`/`punctuate` to reduce false positives.
  - **Alternatives**:
    - Regex-only question detection without `?`: more false positives on statements that start with "what/how" mid-sentence.
    - Silence-only finalization: accurate but still forces user waiting and fails for long questions with pauses.

- **Deduplication guard**
  - Maintain a last-auto-finalized question string and do not retrigger for identical text.
  - **Why**: Partials can stabilize and be emitted multiple times; de-dupe prevents repeated answer generations.
  - **Alternatives**:
    - Time-based cooldown only: can still duplicate if partial repeats after cooldown.
    - Hashing with normalization: more robust but unnecessary for first iteration.

- **Serialize chunk flush**
  - Ensure only one chunk flush is in-flight at a time.
  - **Why**: Interval ticks can overlap, leading to races between stop/unload/start and unreliable STT output.
  - **Alternatives**:
    - Replace interval with recursive `setTimeout` scheduled after flush completes (future improvement).

## Risks / Trade-offs

- **[Risk] Auto-finalize triggers too early** → **Mitigation**: require `?` and minimum length; also gate via `isLikelyQuestion()`.
- **[Risk] Auto-finalize misses questions without `?`** → **Mitigation**: rely on silence-based finalization and manual Stop as fallback; consider expanding heuristics later.
- **[Trade-off] 4000ms chunks add latency vs 2500ms** → **Mitigation**: auto-finalize can reduce perceived latency when punctuation arrives early; future work is realtime streaming.
- **[Risk] Deepgram model changes impact cost/latency** → **Mitigation**: keep parameters centralized to allow easy tuning; surface errors via existing debug events.

