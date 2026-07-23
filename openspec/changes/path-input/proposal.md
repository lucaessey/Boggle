## Why

Players need to trace words on the board by dragging across tiles. This change
makes the board interactive with a single Pointer Events code path (mouse +
touch) and captures the traced path. Path rules (adjacency, backtracking, no
reuse) live in a pure module so they can be unit-tested independently of the DOM;
the React component is a thin adapter. No dictionary or scoring yet.

## What Changes

- Add a pure, DOM-free **path module** (`src/core/path/`):
  - `extendPath(state, candidate, neighbours)` — the trace state machine.
  - `hitTest(point, centers, radius)` — nearest tile center within a radius.
  - `pathWord(faces, state)` — the traced letters for a path.
- Make the board component interactive via **Pointer Events**:
  - A tile is selected when the pointer is within `tileHitRadiusPx` of its centre.
  - A tile is added only if it is 8-way adjacent to the current last tile and not
    already in the path.
  - Dragging back onto the second-to-last tile removes the last tile; dragging
    onto any other used tile does nothing.
  - Selected tiles are highlighted and a line connects the path.
  - The in-progress word shows above the grid; on release the traced word shows
    below the grid and the path clears.

No breaking changes. Consumes the existing board model; no dictionary/scoring.

## Capabilities

### New Capabilities

- `path-input`: Drag-to-trace path selection — a pure trace state machine
  (adjacency, backtrack, no-reuse) plus pointer hit-testing, surfaced through an
  interactive board component.

### Modified Capabilities

<!-- None. -->

## Impact

- **New code:** `src/core/path/` (pure module + tests); an interactive board
  component replacing the static `BoardView`.
- **`src/balance.json`:** none — reuses `tileHitRadiusPx` and `gridSize`.
- **Downstream:** `round-core` will validate/score the traced words this produces.
