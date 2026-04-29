## ADDED Requirements

### Requirement: Evaluate silence-finalized utterances before calling LLM
When an utterance is finalized due to silence detection (VAD silence window), the system SHALL evaluate whether it is a question before triggering an LLM call.

#### Scenario: Silence-finalized question triggers LLM
- **WHEN** an utterance is finalized due to silence detection
- **AND WHEN** the finalized text is likely a question according to the app's question detection rules
- **THEN** the system MAY call the LLM (subject to guardrails: minimum length, cooldown, and dedupe)

#### Scenario: Silence-finalized non-question does not trigger LLM
- **WHEN** an utterance is finalized due to silence detection
- **AND WHEN** the finalized text is not likely a question
- **THEN** the system SHALL NOT call the LLM
- **AND THEN** the system continues listening

