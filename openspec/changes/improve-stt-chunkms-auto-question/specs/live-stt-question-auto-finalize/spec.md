## ADDED Requirements

### Requirement: Auto-finalize a detected question during live listening
When the user is in a live listening session, the system SHALL be able to automatically finalize and process a detected question without requiring the user to manually stop the session.

#### Scenario: Auto-finalize on a complete question marker
- **WHEN** the live transcript partial ends with a question mark (`?`) and meets minimum length requirements
- **THEN** the system finalizes the transcript as a question
- **AND THEN** the system triggers answer generation for that question
- **AND THEN** the system continues listening after answer generation completes

#### Scenario: Do not auto-finalize on non-questions
- **WHEN** the live transcript partial is not likely a question (e.g., no question indicator and does not match question patterns)
- **THEN** the system SHALL NOT auto-finalize the transcript
- **AND THEN** the system continues listening normally

#### Scenario: Prevent duplicate auto-finalization
- **WHEN** the same detected question text appears repeatedly in partial transcript updates
- **THEN** the system SHALL trigger auto-finalization at most once per unique question text

