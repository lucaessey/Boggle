## ADDED Requirements

### Requirement: Per-screen backgrounds with scrim
The app SHALL render a fixed full-height background image behind all content,
imported as Vite assets (base-safe for Pages). `background_1` SHALL be used on the
multiplayer lobby and the round-length selector; `background_2` on every other
screen. It SHALL use `background-size: cover`, centered, no repeat, and SHALL NOT
use `background-attachment: fixed`. Both images SHALL be preloaded. A
semi-transparent scrim with a tunable CSS opacity variable SHALL sit between the
image and content so all text remains legible.

#### Scenario: Correct background per screen
- **WHEN** the round-length selector or the lobby is shown
- **THEN** background_1 is used; every other screen uses background_2

### Requirement: Beveled tiles that press in
Each tile SHALL have a subtle 3D look using box-shadow only (no filter,
backdrop-filter, or 3D transforms): an outer drop shadow plus an inset bevel
(light top-left, dark bottom-right). When a tile is in the current path it SHALL
press in — `translateY` down, a smaller outer shadow, and a flipped bevel — via
transform and shadow changes only (no layout). The transition SHALL be ~80ms,
`will-change` SHALL apply only to path tiles, and `prefers-reduced-motion` SHALL
keep the static bevel without the animation. Tile centers used for hit-testing
SHALL NOT move (measured at pointerdown).

#### Scenario: Press does not reflow or move hit centers
- **WHEN** a tile is selected during a drag
- **THEN** only its transform and box-shadow change, and hit-testing (measured at pointerdown) is unaffected
