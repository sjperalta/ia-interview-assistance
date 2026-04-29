## Why

The Settings UI presents controls for silence threshold, answer style, and reset, but the “reset” behavior is ambiguous (settings reset is bundled with clearing history) and settings values are not explicitly validated/guarded. This change makes these options clearly functional, robust, and aligned with user expectations.

## What Changes

- Ensure **silence threshold** changes are persisted and reliably applied to live listening finalization behavior.
- Ensure **answer style** selection is persisted and reliably applied to DeepSeek answer generation.
- Add a dedicated **Reset settings** action (restore defaults) that does not clear history.
- Keep a separate **Reset app data** action (clears history + resets settings) with clearer labeling.
- Add lightweight validation/normalization for settings values to prevent invalid data from being stored/used.

## Capabilities

### New Capabilities
- `settings-silence-threshold`: Persist and apply the “silence threshold” (VAD silence window) setting to live session transcription finalization.
- `settings-answer-style`: Persist and apply the answer style setting to the LLM answer generation request.
- `settings-reset`: Reset settings to defaults without clearing history, and optionally support a separate “reset app data” flow (history + settings).

### Modified Capabilities
- (none)

## Impact

- Affected code:
  - `features/settings/screens/settings-screen.tsx` (reset actions and copy/labels)
  - `features/settings/hooks/use-settings.ts` (reset/update behavior)
  - `features/settings/services/settings-repo.ts` (validation/normalization on get/set)
  - `features/interview/hooks/use-interview.ts` (ensuring live session reads current settings when starting)
  - `features/history/services/history-repo.ts` (only for “reset app data” path)
- UX: users can change silence threshold and answer style with confidence, and reset settings independently.
