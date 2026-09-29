---
name: run-e2e-locally
description: Start the sample online banking app and run the Playwright suite (desktop and mobile viewports) with evidence captured. Use before and after any change to the app or the tests.
---

# Run the e2e suite locally

1. Install once: `cd e2e/online-banking-e2e && npm install && npx playwright install chromium webkit`. If browser download is blocked, point `PW_EXECUTABLE_PATH` at a Chromium already on the machine.
2. Run everything: `npm test`. The config starts `apps/online-banking-web/server.js` on port 3000 and waits for `/health`.
3. Run one surface: `npm run test:desktop` or `npm run test:mobile`. Run one test: `npx playwright test -g "insufficient funds"`.
4. Against a shared environment: `APP_URL=https://... npm test`. The app is not started in that case.
5. Evidence is written to `playwright-report/` (HTML) and `test-results/` (traces, screenshots, `results.json`). Attach the trace zip of any failure to the pull request.
6. Reproduce the "locator changed" scenario with `LOCATOR_DRIFT=1 npm run test:desktop`; the three transfer tests fail on `transfer-submit`.

Do not edit `test-data/seed.json` by hand; change `personas.json` and run `node test-data/generate.js`.
