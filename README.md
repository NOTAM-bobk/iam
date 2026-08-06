# Bloom — Daily Affirmations

A playful, minimal daily-affirmations app. Swipe through cards, heart your
favorites, share them, and explore more via two free APIs. Built with React
+ Vite, styled in a Material You 3 "Expressive" system (rounded blob
cards, pill buttons, a violet/coral/amber palette).

## Files that matter

- `src/affirmations.js` — **edit this to add/remove affirmations or categories.** Nothing else needs to change.
- `src/App.jsx` — main app shell: Today feed (swipeable cards) + bottom nav + shared state (favorites, categories, theme).
- `src/Onboarding.jsx` — first-run flow: welcome → pick categories → ready.
- `src/Other.jsx` — Explore tab, pulls from two free APIs (affirmations.dev and dummyjson quotes).
- `src/Settings.jsx` — edit categories, manage favorites, light/dark theme, reset onboarding.
- `src/main.jsx` / `src/index.css` — entry point and design tokens/styles.

All data lives in the browser's `localStorage` — no backend or database needed.

## Deploy it (no computer needed)

**1. Get this code onto GitHub**
- Go to [github.com/new](https://github.com/new) and create a new repository (e.g. `daily-affirmations`).
- On the repo page, click **"uploading an existing file."**
- Unzip the file you downloaded first (on your phone: tap the .zip, most Files apps have an "Extract" or "Unzip" option) — GitHub needs the individual files, not the .zip itself.
- Drag all the extracted files and folders (`src`, `index.html`, `package.json`, etc.) into the GitHub upload box, then commit.

**2. Connect it to Vercel**
- Go to [vercel.com/new](https://vercel.com/new) and sign in with your GitHub account.
- Select the repository you just created and click **Import**.
- Vercel auto-detects the Vite framework and correct build settings — just click **Deploy**.
- In a minute or two you'll get a live `.vercel.app` link you can open on your phone.

Any time you edit `src/affirmations.js` (or anything else) on GitHub directly — using GitHub's built-in web editor (press `.` on the repo page, or tap "Edit" on a file) — Vercel will automatically redeploy.

## Local development (optional, if you ever get a computer)

```
npm install
npm run dev
```
