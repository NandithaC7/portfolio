# AGENTS.md

## Cursor Cloud specific instructions

This is a single-page personal portfolio built with Create React App (CRA,
`react-scripts` 5.0.1) using React 19. Package manager is npm (`package-lock.json`).
Dependencies are installed automatically by the startup update script (`npm install`).

Services / commands (all standard CRA scripts in `package.json`):
- Dev server: `npm start` (serves on port 3000; set `BROWSER=none` in headless
  environments to avoid a browser-launch attempt).
- Tests: `npm test` (watch mode). Use `CI=true npx react-scripts test` for a
  single non-interactive run.
- Build: `npm run build`.
- Lint: there is no separate lint script; ESLint (`react-app` config) runs
  automatically as part of `npm start` and `npm run build`.

Non-obvious notes:
- The default test `src/App.test.js` is leftover CRA boilerplate that asserts
  "learn react" text, which this custom portfolio does not render, so that single
  test fails. This is a pre-existing content mismatch, not an environment problem;
  the Jest runner itself works correctly.
- `App.js` has a harmless pre-existing ESLint warning (`toggleTheme` assigned but
  never used). It does not block the dev server or build.
- Asset images live in `src/assets/` and must be imported with relative paths
  (e.g. `../assets/mypic.jpeg`). CRA rejects imports that resolve outside `src/`.
