## ADDED Requirements

### Requirement: Prompts MUST exclude UI/debug state
The system SHALL construct LLM prompts using only the information required to produce an answer, and MUST NOT include UI state, debug logs, timestamps, or internal event traces.

#### Scenario: Prompt contains only finalized question and formatting constraints
- **WHEN** the system calls the LLM to generate an answer
- **THEN** the prompt SHALL include the finalized question text
- **AND THEN** the prompt SHALL include only minimal formatting instructions needed to enforce the desired output format
- **AND THEN** the prompt SHALL NOT include UI/debug state

### Requirement: Output constraints MUST be explicit and minimal
The system SHALL request a compact response format suitable for rapid reading.

#### Scenario: Max bullets and no preamble
- **WHEN** the system calls the LLM
- **THEN** the prompt SHALL require a maximum of 3 bullet points
- **AND THEN** the prompt SHALL disallow preambles/headings/long paragraphs

