## ADDED Requirements

### Requirement: Touch-safe drag behaviour
The grid SHALL set `touch-action: none` so finger drags trace instead of
scrolling, and `overscroll-behavior` to prevent pull-to-refresh from interfering
with downward drags. Tiles SHALL disable text selection and the tap-highlight
flash. A drag SHALL use pointer capture so it tracks outside the grid bounds, and
a `pointercancel` SHALL clear the path without submitting.

#### Scenario: Cancelled pointer does not submit
- **WHEN** an in-progress drag receives a pointercancel (e.g. an incoming call)
- **THEN** the path is cleared and no word is submitted

#### Scenario: Drag outside the grid still tracks
- **WHEN** a drag strays outside the grid bounds
- **THEN** pointer capture keeps the trace tracking

### Requirement: Mobile layout
The page SHALL use `viewport-fit=cover` and respect safe-area insets. The grid,
timer, current word, and score SHALL fit a 375×667 viewport without scrolling at
all three board sizes, in both portrait and landscape. Interactive controls
SHALL have a touch target of at least 44×44px and disable double-tap zoom.

#### Scenario: Fits a small viewport at every size
- **WHEN** the game is played on a 375×667 viewport at 4×4, 6×6, or 7×7
- **THEN** the grid, timer, current word, and score are visible without scrolling

#### Scenario: Safe-area respected
- **WHEN** the device has a notch or home indicator
- **THEN** content is inset so nothing sits under them

### Requirement: Haptic feedback
The game SHALL provide haptic feedback via `navigator.vibrate` on tile selection
and on word acceptance, guarded for browsers without the API and toggleable via
`balance.json`.

#### Scenario: Guarded and toggleable
- **WHEN** haptics are disabled in balance.json or the browser lacks vibrate
- **THEN** no vibration is attempted and the game behaves normally
