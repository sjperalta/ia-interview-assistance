## ADDED Requirements

### Requirement: Reset settings to defaults without clearing history
The system SHALL provide a Settings action that resets app settings back to defaults without clearing local history.

#### Scenario: Reset settings only
- **WHEN** the user triggers “Reset settings”
- **THEN** the system SHALL restore settings to default values
- **AND THEN** local history SHALL remain intact
- **AND THEN** the Settings UI SHALL reflect default values

### Requirement: Reset app data clears history and resets settings
The system SHALL provide a separate action that clears local history and resets settings to defaults.

#### Scenario: Reset app data
- **WHEN** the user triggers “Reset app data”
- **THEN** the system SHALL clear local history
- **AND THEN** the system SHALL restore settings to default values

