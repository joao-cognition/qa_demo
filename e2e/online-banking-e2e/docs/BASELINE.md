# QA pilot baseline — Online Banking (JD-146)

One page recorded at the start of the pilot so it can be repeated on the next application by changing this file. Written by the `!QA_pilot` playbook, step 1.

## Repositories, environment, integrations

| Item | Value |
| --- | --- |
| Application repository | `joao-cognition/qa_demo`, `apps/online-banking-web` (plain Node, no dependencies) |
| End-to-end repository | `joao-cognition/qa_demo`, `e2e/online-banking-e2e` (Playwright TypeScript) |
| Legacy suite | `joao-cognition/qa_demo`, `legacy/pytalos-disputes` (Behave + Selenium, Talos shape; not run here) |
| Native mobile | `e2e/mobile-app-e2e` is a WebdriverIO + Appium skeleton only; no app build, no device cloud. Out of scope for this pilot |
| Test environment | Started from the repo: `node apps/online-banking-web/server.js` → http://localhost:3000. `/health` reports `locatorDrift` |
| Test user | `demo.user` (public demo credential in `test-data/personas.json`); no secret store entry needed |
| Jira | cog-gtm.atlassian.net, project JD, epic JD-146. Reached through the Atlassian MCP |
| Xray | Not installed on this Jira. Manual cases are drafted to `xray/test-cases.draft.json`; `npm run xray:export` writes the payload to `xray/last-export.json` and does not post |
| CI | GitHub Actions in `.github/workflows`: `e2e` (PR + manual), `devin-fix-failing-e2e` (on failed `e2e` run), `devin-generate-tests` (manual). Needs the `DEVIN_API_KEY` repository secret for the two Devin workflows |
| Default branch | `master`. Pull requests target `master`; Devin does not merge |

## Framework and conventions found

| Question | Answer |
| --- | --- |
| Framework | `@playwright/test` ^1.60, TypeScript, `testDir: ./tests` |
| Playwright suite exists | Yes: 9 tests × 3 projects (`desktop-chromium`, `mobile-android`, `mobile-ios`) = 27, all passing on `master` in ~15 s |
| Talos suite exists | Yes: `legacy/pytalos-disputes`, 3 scenarios (`TC-DISP-001..003`, one outline with 2 examples). The dispute screens do not exist in the sample app |
| Page objects | `pages/` — one per screen (`LoginPage`, `AccountsPage`, `TransferPage`); locators live only there; `getByTestId` first |
| Fixtures | `fixtures/index.ts` extends `test` with page objects and an auto `resetData` fixture that calls `POST /api/reset` before every test |
| Test data today | `test-data/personas.json` → `node test-data/generate.js` (seeded, deterministic) → `test-data/seed.json`, loaded by the app at start and on reset. Tests read personas through `fixtures/test-data.ts`; `seed.json` is never edited by hand |
| Results to Jira | Each `test()` carries `{ annotation: { type: "xray", description: "<KEY>" } }`; `xray/export-results.mjs` maps `test-results/results.json` to an Xray import payload |
| Locator drift demo | `LOCATOR_DRIFT=1` renames the confirm button test id `transfer-submit` → `confirm-payment`; every desktop test that presses the confirm button fails (3 on `master`, 5 once JD-141 lands) |

## Path chosen per surface (step 2)

| Surface | Path |
| --- | --- |
| Web desktop (`desktop-chromium`) | Suite exists → `!QA_generate_e2e_tests` directly |
| Mobile web (`mobile-android`, `mobile-ios`) | Same suite, same tests; Playwright device projects |
| Disputes journey (Talos) | `!QA_migrate_talos_to_playwright`, stopping after inventory + page object draft (screens missing in the app) |
| Native Android / iOS | Not in scope; would go through `!QA_mobile_app_e2e` first |

## Stories in scope

| Story | Playbook | Notes |
| --- | --- | --- |
| JD-140 Statement shows what happened to my money | `!QA_generate_e2e_tests` | Xray keys `JD-140-TC1`, `JD-140-TC2` |
| JD-141 Daily limit protects the customer | `!QA_generate_e2e_tests` | Persona `daily.limit` prepared once by the pilot (`!QA_prepare_test_data`); keys `JD-141-TC1`, `JD-141-TC2` |
| JD-147 Transfer confirm button renamed | `!QA_repair_failing_e2e` | Reproduce with `LOCATOR_DRIFT=1 npm run test:desktop` |
| JD-148 Migrate the disputes Talos suite | `!QA_migrate_talos_to_playwright` | Inventory + page object draft only |

## Access check (step 3)

| Item | Result |
| --- | --- |
| Repository clone | OK |
| Environment | OK — app starts on :3000 from the Playwright `webServer`, `/health` answers |
| Test user | OK — `demo.user` logs on (login suite green) |
| Jira | OK — read/write through the Atlassian MCP |
| Xray | Not installed; draft-file flow per the working agreement, so no test plan link exists |
| CI secrets | `DEVIN_API_KEY` presence could not be read (GitHub API 403 for the integration). The Xray secrets are intentionally unset |
| Branch protection on `master` | Not readable by the integration; Devin does not change it either way |
