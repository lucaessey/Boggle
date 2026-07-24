## 1. Backgrounds

- [x] 1.1 Move background_1/2 into src/assets; import as Vite assets; report paths/sizes/dimensions (both < 500KB).
- [x] 1.2 `Background` provider: fixed cover layer + preload both + tunable `--scrim-opacity` scrim (theme-aware); NOT background-attachment: fixed.
- [x] 1.3 `useScreenBackground`; wire Menu length step + Lobby to background_1, everything else background_2.

## 2. 3D tiles

- [x] 2.1 Base bevel (outer drop + inset light TL / dark BR) via box-shadow only.
- [x] 2.2 Press-in on `.selected`: translateY + shrunken outer + flipped bevel; ~80ms; transform/shadow only.
- [x] 2.3 `will-change: transform` only on path tiles; `prefers-reduced-motion` keeps static bevel.

## 3. Verify

- [x] 3.1 `npm test` passes; build works for Pages (assets emitted/inlined base-safe).
- [x] 3.2 In-browser: background switches per screen; scrim behind content; tiles beveled; single-player plays; no console errors. (Press animation + 7×7 fast-swipe smoothness need a visible device — the preview pane runs backgrounded.)
