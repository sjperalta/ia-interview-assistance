## 1. Settings validation and persistence

- [x] 1.1 Add validation/normalization for `vadSilenceMs` and `answerStyle` in `features/settings/services/settings-repo.ts`
- [x] 1.2 Ensure Settings UI reads and reflects persisted values on load (`features/settings/screens/settings-screen.tsx`)

## 2. Apply settings to live session + answer generation

- [x] 2.1 Ensure `startListening()` reads current settings and uses `vadSilenceMs` for speech stream start options
- [x] 2.2 Ensure answer generation uses the persisted `answerStyle` (passed into `generateInterviewAnswer`)

## 3. Reset settings vs reset app data

- [x] 3.1 Add a dedicated “Reset settings” action that restores defaults without clearing history
- [x] 3.2 Keep a separate “Reset app data” action that clears history and resets settings; update copy/labels for clarity

## 4. Verification

- [x] 4.1 Manual test: change silence threshold, start a session, verify finalization timing changes
- [x] 4.2 Manual test: change answer style, ask a question, verify output style changes
- [x] 4.3 Manual test: reset settings only, verify defaults restored and history preserved
- [x] 4.4 Manual test: reset app data, verify history cleared and settings reset

