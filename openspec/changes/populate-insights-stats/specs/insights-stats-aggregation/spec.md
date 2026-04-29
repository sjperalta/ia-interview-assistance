## ADDED Requirements

### Requirement: Insights SHALL surface real local statistics

The Insights experience SHALL display `InsightStats` derived from local application data (history and/or explicit telemetry), not hard-coded mock values.

#### Scenario: Questions answered matches history

- **WHEN** the Insights screen loads
- **THEN** `questionsAnswered` SHALL equal the number of items returned by local history storage (same cardinality as the user-visible history list within retention limits)

#### Scenario: Practice time accumulates from live sessions

- **WHEN** the user completes a live listening session (stops listening after active time was recorded)
- **THEN** the app SHALL add that session’s elapsed practice seconds to a persisted cumulative total
- **AND THEN** Insights SHALL format and display that cumulative total as practice time

#### Scenario: Total sessions increments on meaningful session end

- **WHEN** the user stops a live session that had non-zero practice duration (or at least one answered question saved in the session, per implementation choice in design)
- **THEN** the persisted total session count SHALL increase by one

#### Scenario: Average confidence uses stored per-answer confidence when available

- **WHEN** one or more history items include a stored STT confidence value
- **THEN** Insights SHALL show an average confidence derived from those values
- **WHEN** no history item includes confidence
- **THEN** Insights SHALL not fabricate a numeric average (SHALL show a clear empty/zero/placeholder state per UI decision)
