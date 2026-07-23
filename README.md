# Boggle

A Boggle-like word game, built as a mobile-first PWA.

- **Stack:** Vite + React + TypeScript
- **Deploy target:** GitHub Pages (no backend; all state in `localStorage`)
- **Vite `base`:** set to `./` so the build works from a Pages project subpath.

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build    # typecheck + production build
npm test         # run unit tests (Vitest)
```

## Balance file

`src/balance.json` is the single source of truth for all tunable constants.
There should be **no magic numbers** elsewhere in the codebase — components and
logic import their values from here.

### `scoreByLength`

The keys of `scoreByLength` are **minimum word lengths**, and each value is the
points awarded for a word of that length. A word scores the value of the
largest key that is less than or equal to its length. The key `"8"` therefore
means **"8 or more letters"** — every word of length 8+ scores 11 points.

| Word length | Points |
| ----------- | ------ |
| 3           | 1      |
| 4           | 1      |
| 5           | 2      |
| 6           | 3      |
| 7           | 5      |
| 8 or more   | 11     |
