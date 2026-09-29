# santander-uk-qa-reference

A small, runnable stand-in for the customer's setup, built so the QA automation playbooks can be shown end to end before they touch a real application. It contains an online banking web app, an end-to-end suite kept apart from the app (as the customer's suites are), a legacy Talos style suite to migrate, the shape of a native mobile suite, shared test data, CI workflows that start Devin, and the playbooks and skills Devin follows.

```
apps/online-banking-web/     sample app: log on, accounts, statement, transfer. Plain Node, no dependencies
e2e/online-banking-e2e/      Playwright suite: desktop + two mobile viewports, page objects, Xray export
e2e/mobile-app-e2e/          skeleton of a WebdriverIO + Appium suite for a native app (needs a device cloud)
legacy/pytalos-disputes/     Behave + Selenium suite in the Talos shape, the migration source
test-data/                   personas.json -> generate.js -> seed.json, shared by app and tests
.devin/playbooks/            the seven playbooks
.agents/skills/              run-e2e-locally, prepare-test-data, xray-sync, repair-locators
.github/workflows/           e2e on PR, Devin repair on failure, Devin generate on demand
docs/                        demo script and architecture notes
```

## Run it

```bash
cd e2e/online-banking-e2e
npm install
npx playwright install chromium webkit
npm test                           # starts the app on :3000 and runs 27 tests across three projects
```

Useful variations:

```bash
npm run test:desktop                     # one project
APP_URL=https://sit.example npm test     # shared environment, app not started
LOCATOR_DRIFT=1 npm run test:desktop     # app renames a test id; 3 transfer tests fail
npm run xray:export                      # results -> Xray payload, dry run without secrets
```

To run the app on its own, start `node apps/online-banking-web/server.js` and open http://localhost:3000. Users are in `test-data/personas.json` (`demo.user` / `Passw0rd!`).

## Demo use

The demo script in `docs/DEMO-SCRIPT.md` walks through the four moments: Devin generating tests from a story, Devin preparing test data, CI failing on a renamed locator and Devin repairing it, and the Talos suite being migrated. `docs/ARCHITECTURE.md` maps every folder to the customer's real systems and lists what has to be connected before the pilot.

## Placeholders

A native mobile app, a device cloud, a real Jira project. Each has a placeholder that shows the shape and names the access needed.
