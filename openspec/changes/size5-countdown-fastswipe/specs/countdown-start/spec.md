## ADDED Requirements

### Requirement: Countdown before play
Every mode SHALL begin with a `countdownSeconds` countdown (3, 2, 1, then GO!)
instead of a Start button. During the countdown the board SHALL be shown
face-down at its final positions without relayout or remounting, all input
(pointer and keyboard) SHALL be ignored, and the round timer SHALL start only
when the countdown ends. Play Again SHALL start a fresh countdown.

#### Scenario: Board hidden and input blocked during countdown
- **WHEN** the countdown is running
- **THEN** the tiles are face-down, pointer and key input do nothing, and the timer has not started

#### Scenario: Timer starts at zero
- **WHEN** the countdown reaches zero
- **THEN** the board is revealed, input is enabled, and the round timer begins

### Requirement: Concurrent solve in Peaceful mode
In Peaceful mode the Web Worker solve SHALL start when the board is generated and
run concurrently with the countdown. If the solve is still running when the
countdown ends, a loading state SHALL hold until it completes, then reveal the
board and begin.

#### Scenario: Solve hidden behind the countdown
- **WHEN** a Peaceful round starts and the solve finishes before the countdown ends
- **THEN** play begins immediately at zero with no separate loading delay
