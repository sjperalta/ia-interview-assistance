## ADDED Requirements

### Requirement: Persist and apply answer style
The system SHALL allow the user to select an answer style and persist it locally. The selected value MUST be used when generating interview answers.

#### Scenario: Update answer style in Settings
- **WHEN** the user selects an answer style option in Settings
- **THEN** the system SHALL persist the selected value locally
- **AND THEN** the Settings UI SHALL reflect the selection as active

#### Scenario: Answer style affects answer generation
- **WHEN** the system calls the LLM to generate an interview answer
- **THEN** the system SHALL pass the persisted answer style as the `style` input to the answer generation call

### Requirement: Validate answer style values
The system SHALL validate persisted answer style values and fall back to defaults when invalid.

#### Scenario: Invalid value in storage
- **WHEN** an invalid `answerStyle` is read from storage
- **THEN** the system SHALL fall back to the default value

