# online-banking-e2e

Playwright suite for the sample online banking app. It is kept in its own folder to mirror the customer setup, where end-to-end suites live apart from the application repositories.

```bash
npm install
npx playwright install --with-deps chromium webkit   # browsers + OS libs (webkit needs them); on a locked-down machine set PW_EXECUTABLE_PATH instead
npm test                          # desktop plus two mobile viewports, starts the app itself
APP_URL=https://test.example npm test   # run against a shared environment
LOCATOR_DRIFT=1 npm run test:desktop    # simulate the app renaming a test id: three transfer tests fail
npm run xray:export               # map results to Xray keys, dry run unless XRAY_* secrets are set
```

Layout: `pages/` holds one page object per screen and is the only place locators live. `fixtures/` resets the app data before every test and exposes the personas from `test-data/personas.json`. Each test carries an `xray` annotation with the manual test case key it automates. `migration/` holds the inventory tables of suites migrated from Talos; scenarios whose screens the app does not have yet are kept as `test.fixme` so they stay visible to the Xray export.
