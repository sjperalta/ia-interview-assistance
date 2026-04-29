## ADDED Requirements

### Requirement: Persist and apply silence threshold (VAD silence window)
The system SHALL allow the user to select a silence threshold value and persist it locally. The selected value MUST be used when starting a live listening session to determine how quickly speech is finalized after silence.

#### Scenario: Update silence threshold in Settings
- **WHEN** the user selects a silence threshold option in Settings
- **THEN** the system SHALL persist the selected value locally
- **AND THEN** the Settings UI SHALL reflect the selection as active

#### Scenario: Silence threshold affects live session finalization
- **WHEN** the user starts a live listening session
- **THEN** the system SHALL use the persisted silence threshold value as `vadSilenceMs` for the speech stream

### Requirement: Validate silence threshold values
The system SHALL validate persisted silence threshold values and fall back to defaults when invalid.

#### Scenario: Invalid value in storage
- **WHEN** an invalid `vadSilenceMs` is read from storage (e.g., not a number or outside supported range/options)
- **THEN** the system SHALL fall back to the default value

