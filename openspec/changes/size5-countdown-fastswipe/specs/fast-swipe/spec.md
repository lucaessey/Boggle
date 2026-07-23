## ADDED Requirements

### Requirement: Interpolated fast-swipe tracing
Drag tracing SHALL keep up with fast flicks. It SHALL use `getCoalescedEvents()`
where available to recover buffered samples, and between consecutive sample
points interpolate at a step no larger than half a tile width, hit-testing each
interpolated point against the per-size hit radius. Crossed tiles SHALL be added
in the order crossed, under the existing 8-way adjacency and no-reuse rules. A
non-adjacent jump with no interpolated bridge SHALL be rejected, not bridged. The
move listener SHALL be registered `{ passive: false }`, per-move state updates
SHALL be batched in a `requestAnimationFrame` callback, and only tiles whose
selected state changed SHALL re-render.

#### Scenario: Straight flick across a row
- **WHEN** a fast flick reports positions several tiles apart along a row
- **THEN** every tile crossed is added in order

#### Scenario: Diagonal flick at 7x7
- **WHEN** a fast flick crosses the grid diagonally at 7×7
- **THEN** the correct diagonal tile sequence is captured in order

#### Scenario: Non-adjacent jump rejected
- **WHEN** interpolation yields only a destination tile not adjacent to the current tile
- **THEN** the addition is rejected rather than silently bridged
