## Context

The app already has a settings domain with:
- persisted settings in `expo-secure-store` (`features/settings/services/settings-repo.ts`)
- a hook to load/update/reset settings (`features/settings/hooks/use-settings.ts`)
- a Settings UI with controls for whisper default, silence threshold (`vadSilenceMs`), answer style, and a “Reset app data” CTA (`features/settings/screens/settings-screen.tsx`)

However, the user intent is “make these options functional,” which requires:
- ensuring the values are reliably persisted and applied to runtime behavior (live session start + LLM generation)
- clarifying reset semantics: “reset settings” vs “reset app data”
- preventing invalid values from being stored/used (defensive validation)

## Goals / Non-Goals

**Goals:**
- Ensure `vadSilenceMs` is the single source of truth for speech finalization timing on session start.
- Ensure `answerStyle` is the single source of truth for answer generation style.
- Provide two clear reset actions:
  - Reset settings only (defaults; does not clear history)
  - Reset app data (clear history + reset settings)
- Add lightweight settings validation/normalization on read/write to avoid corrupted storage values.

**Non-Goals:**
- Add new settings beyond the ones requested.
- Add server-side settings sync.
- Build a complex settings schema/versioning system beyond current `settings:v1`.

## Decisions

- **Validation location**
  - Add validation/normalization inside `settingsRepo.get()` (and optionally `settingsRepo.set()`), so all consumers receive safe values.
  - Rationale: centralizes correctness and avoids duplicating guard logic in every screen/hook.

- **Reset semantics**
  - Keep `settingsRepo.reset()` as “reset settings to defaults” (delete key).
  - Update Settings UI to expose:
    - “Reset settings” (calls `reset()` only)
    - “Reset app data” (calls `historyRepo.clear()` + `reset()`)
  - Rationale: matches user expectation (“reset app settings”) while preserving existing “wipe everything” option.

- **Applying settings to runtime behavior**
  - Live session should read settings at the time `startListening()` is called and use:
    - `vadSilenceMs` to configure the speech stream start options
    - `answerStyle` to pass into `generateInterviewAnswer`
  - Rationale: ensures changes from Settings are applied the next time the user starts a session.

## Risks / Trade-offs

- **[Risk] Users expect settings changes to apply mid-session** → **Mitigation**: define behavior as “applies on next session start” (can be extended later).
- **[Risk] Reset actions are confusing** → **Mitigation**: clear copy/labels and separate buttons/sections in the Settings UI.
- **[Risk] Validation rejects existing stored values** → **Mitigation**: fall back to defaults (never crash) and allow only known enumerations/options.

