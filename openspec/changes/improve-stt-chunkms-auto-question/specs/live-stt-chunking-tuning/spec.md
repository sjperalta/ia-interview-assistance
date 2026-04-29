## ADDED Requirements

### Requirement: Apply live STT chunk timing defaults optimized for accuracy
The system SHALL use chunking defaults for live STT that are tuned for accuracy while maintaining acceptable responsiveness.

#### Scenario: Default chunk size
- **WHEN** a live listening session starts
- **THEN** the system SHALL use a default chunk interval of 4000ms for chunk-based transcription

#### Scenario: Silence-based finalization remains supported
- **WHEN** the speaker pauses for at least the configured silence window
- **THEN** the system SHALL finalize the buffered transcript as an utterance
- **AND THEN** the system SHALL reset the buffer for the next utterance

