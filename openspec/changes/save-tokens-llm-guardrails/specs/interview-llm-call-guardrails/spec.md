## ADDED Requirements

### Requirement: Enforce minimum question length before LLM call
The system SHALL NOT call the LLM to generate an interview answer if the finalized question text is shorter than the configured minimum length.

#### Scenario: Finalized text below minimum length
- **WHEN** a finalized transcript is produced with fewer than 10 non-whitespace characters
- **THEN** the system SHALL NOT call the LLM
- **AND THEN** the system continues listening

#### Scenario: Finalized text meets minimum length
- **WHEN** a finalized transcript is produced with at least 10 non-whitespace characters
- **THEN** the system MAY proceed to additional guardrails (cooldown and dedupe) before calling the LLM

### Requirement: Enforce cooldown between LLM calls
The system SHALL enforce a cooldown window between successive LLM calls within a listening session.

#### Scenario: Cooldown blocks rapid re-triggers
- **WHEN** the system has called the LLM within the last 5 seconds
- **THEN** the system SHALL NOT call the LLM again
- **AND THEN** the system continues listening

### Requirement: Normalize and deduplicate questions before LLM call
Before calling the LLM, the system SHALL normalize the question and suppress calls for duplicates.

Normalization MUST include:
- trimming leading/trailing whitespace
- lowercasing
- collapsing internal whitespace to single spaces
- limiting the normalized string to a reasonable maximum length (to bound memory/comparison cost)

#### Scenario: Duplicate normalized question suppressed
- **WHEN** a finalized transcript normalizes to the same value as the last LLM-called question
- **THEN** the system SHALL NOT call the LLM
- **AND THEN** the system continues listening

#### Scenario: Non-duplicate normalized question allowed
- **WHEN** a finalized transcript normalizes to a different value than the last LLM-called question
- **THEN** the system MAY call the LLM (if other guardrails allow)

