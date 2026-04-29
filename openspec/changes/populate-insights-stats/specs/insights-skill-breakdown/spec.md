## ADDED Requirements

### Requirement: Skill breakdown SHALL be computed locally for Phase 1

The Insights experience SHALL supply `SkillScore[]` for the Skill Breakdown component using a deterministic, local computation over practice history (Phase 1 heuristics), without requiring a network call.

#### Scenario: Skill scores are stable for the same history

- **WHEN** the same history dataset and telemetry snapshot are provided
- **THEN** the computed skill scores SHALL be identical (deterministic)

#### Scenario: Empty history produces a defined baseline

- **WHEN** there are zero history items and zero accumulated practice
- **THEN** the UI SHALL still render without error
- **AND THEN** skill scores SHALL use a documented baseline (e.g. neutral defaults) or hide the breakdown per product choice

#### Scenario: User-visible honesty for estimates

- **WHEN** skill scores are heuristic-based
- **THEN** the UI SHOULD indicate they are estimates (e.g. subtitle copy), unless product explicitly chooses not to
