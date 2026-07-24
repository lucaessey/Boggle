## ADDED Requirements

### Requirement: The post-round solve always resolves
The results solve SHALL always reach a resolved (`ready`) or errored (`failed`)
state and SHALL NEVER remain in `loading`. The effect that runs the solve SHALL
NOT cancel its own in-flight request. If no result arrives within `solveTimeoutMs`
(balance.json), the state SHALL become `failed`, the spinner SHALL stop, and the
reveal buttons SHALL be hidden with a "Couldn't load the full word list" message.
The worker SHALL handle both `error` and `messageerror` by falling back to the
main thread.

#### Scenario: Reaches a resolved state at every size
- **WHEN** a round ends at any board size
- **THEN** the solve state becomes `ready` (or `failed`), never staying on `loading`

#### Scenario: Timeout safety net
- **WHEN** the solve produces no result within `solveTimeoutMs`
- **THEN** the state becomes `failed` and the reveal buttons are hidden
