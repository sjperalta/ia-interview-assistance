## Why

Speech recognition quality and usability in Live Session are poor because transcripts lag and users must manually stop the session to trigger question handling. This change improves accuracy and makes the experience hands-free by auto-detecting questions while listening.

## What Changes

- Improve STT quality by tuning chunk timing and Deepgram transcription parameters.
- Auto-recognize complete questions during an active session and trigger answer generation without requiring the user to press Stop.
- Reduce duplicate question triggers when partial transcripts stabilize.

## Capabilities

### New Capabilities
- `live-stt-question-auto-finalize`: Automatically finalize and process a detected question during live listening based on transcript heuristics.
- `live-stt-chunking-tuning`: Define and apply chunk timing defaults that balance accuracy and responsiveness for live STT.

### Modified Capabilities
- (none)

## Impact

- Affected code:
  - `features/interview/hooks/use-interview.ts` (question detection + auto-finalize behavior, chunk defaults)
  - `features/speech/services/deepgram-chunk-stream.ts` (Deepgram transcription request parameters, chunk flush stability)
- External API: Deepgram `/v1/listen` query parameters/model selection.
- UX: Live Session should feel more responsive and require fewer manual actions.
