# Boggle

A Boggle-like word game, built as a mobile-first PWA.

- **Stack:** Vite + React + TypeScript
- **Deploy target:** GitHub Pages; solo progress lives in `localStorage`, while multiplayer and global leaderboards use Firebase.
- **Vite `base`:** `/Boggle/`, matching the Pages project subpath and PWA scope.

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build    # typecheck + production build
npm run preview  # serve the production PWA at http://localhost:4173/Boggle/
npm test         # run unit tests (Vitest)
```

## Install and play offline

Open the deployed HTTPS site (or the local production preview). In supporting
browsers, choose **Install Boggle** on the menu or use the browser's install
command. On iPhone/iPad, use Safari's **Share → Add to Home Screen**, then open
the home-screen icon.

After the first online visit shows **Boggle is ready for offline play**, solo
rounds, all game modes, the dictionary/solver, backgrounds, achievements, and
personal scores work offline, including after closing and reopening the app.
Multiplayer and global leaderboards still require an internet connection.
Browser storage must be retained for offline play and saved progress.

Production builds generate the manifest and a versioned service-worker cache
with `vite-plugin-pwa`. New versions wait for **Update & reload** on the menu,
or for all old app windows to close; the app does not automatically reload an
active round. Service workers are disabled in the development server.

To verify changes, build and preview, visit `/Boggle/`, wait for the offline-ready
message, then switch the browser offline and reload. Start a solo round and
check its results to exercise the cached dictionary and solver worker. To test
updates, keep a preview tab open, change and rebuild the app, then reopen it in
another tab to trigger the update check. Updates should wait for your choice.

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
