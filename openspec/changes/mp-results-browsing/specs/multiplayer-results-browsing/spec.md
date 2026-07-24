## ADDED Requirements

### Requirement: Browse other players' words
The multiplayer results leaderboard SHALL make each row tappable with a clear
affordance, opening a full-screen detail view for that player showing their
nickname, final score, and full word list sorted longest-first with an
alphabetical tie-break. Each word row SHALL show the word, its letter count, the
points that player earned, and a 2× marker on unique-bonus words. Tapping a word
SHALL highlight its board path and tapping again SHALL clear it. A back control
SHALL return to the leaderboard. The player's own row SHALL open the same view.

#### Scenario: Open a player's list sorted longest-first with bonus markers
- **WHEN** a leaderboard row is tapped
- **THEN** that player's detail view opens with their words sorted longest-first (alpha tie-break) and 2× markers on unique words matching the computed scoring

#### Scenario: Tap a word to see its path
- **WHEN** a word in the detail view is tapped
- **THEN** its board path is highlighted, and tapping it again clears the highlight

### Requirement: Board-vs-found longest reveal with attribution
The multiplayer "reveal longest" SHALL show two entries: the longest word(s) on
the board (from the solver, with finder names or "Nobody found this.", all ties
shown) and the longest word(s) anyone found (with finder names, ties handled).
When the board longest and the longest found are the same word, the two entries
SHALL collapse into a single labeled entry. The single-player longest reveal
SHALL be unchanged (board longest only, no attribution).

#### Scenario: Nobody found the board longest
- **WHEN** no player found the board's longest word
- **THEN** the board entry names it with "Nobody found this." and a separate entry shows the longest word anyone did find, with finders

#### Scenario: Collapse when identical
- **WHEN** the board longest equals the longest anyone found
- **THEN** a single labeled entry is shown instead of two

### Requirement: Beaten markers on missed words
The multiplayer missed-words reveal SHALL continue to mean words the current
player did not find (existing cap and sort), and SHALL add a small marker on any
missed word that at least one other player found.

#### Scenario: Marker on a word an opponent found
- **WHEN** a missed word was found by at least one other player
- **THEN** that word shows a marker distinguishing it from words nobody found
