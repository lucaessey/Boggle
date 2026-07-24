## ADDED Requirements

### Requirement: Per size+length high-score records
The system SHALL keep one high-score record per (board size, timed round length)
— 24 slots — with Peaceful mode never recorded. Each record SHALL store score,
words found, longest word, and date. A record SHALL be replaced only by a
strictly higher score (an equal or lower score does not replace it). Records SHALL
be keyed by both size and length (no cross-slot overwrite), persisted by
extending the existing stats module, with the read/write logic pure and
DOM-free. Empty slots SHALL be treated as unplayed, not a score of zero.

#### Scenario: Strictly-higher replacement
- **WHEN** a timed round's score is compared to the slot's record
- **THEN** it replaces the record only if strictly higher; equal or lower does not

#### Scenario: Correct keying
- **WHEN** a 5×5 2:00 record is written
- **THEN** it does not affect the 5×5 3:00 or 6×6 2:00 records

#### Scenario: Peaceful excluded
- **WHEN** a Peaceful round ends
- **THEN** no high-score record is written

### Requirement: High-scores screen
The menu SHALL have a top-right high-scores button (≥44×44) opening a screen with
Back. The screen SHALL show size tabs and, for the selected size, the six timed
lengths as rows with the score (or a dash) and, beneath it, words found / longest
word / date (or "Not played yet"). It SHALL fit a 375px viewport without
horizontal scrolling, remember the last-viewed size for the session, and offer a
reset that clears high scores only (leaving achievements and lifetime stats).

#### Scenario: Empty slots
- **WHEN** a slot has no score
- **THEN** the row shows a dash and "Not played yet"

#### Scenario: Reset scope
- **WHEN** high scores are reset
- **THEN** achievements and lifetime stats are unchanged

### Requirement: New personal best feedback
The system SHALL, when a timed round ends with a strictly higher score for that
size+length, show a celebratory "NEW PERSONAL BEST" banner above the score
summary, including the previous best (or "First score for this board"), animated
and reduced-motion aware. The same message SHALL also fire the toast, queued with
any achievement toasts. The record SHALL be written before the results screen
renders, having read the previous value first. Peaceful rounds SHALL never show
the banner.

#### Scenario: Banner with previous best
- **WHEN** a timed round beats an existing record
- **THEN** the banner shows "NEW PERSONAL BEST" with the previous best, and the toast fires

#### Scenario: Reads previous before writing
- **WHEN** the new record is written
- **THEN** the "previous best" shown reflects the value from before the write
