# Demo script

The demo runs about forty minutes on the sample application, and each part ends in something the audience can open: a pull request, a report, an Xray payload.

## Before the call

- `npm install` and `npx playwright install` in `e2e/online-banking-e2e`; run `npm test` once so browsers and the report exist.
- Push this repository to a GitHub organisation Devin can reach and set `DEVIN_API_KEY` as a repository secret. Leave the Xray secrets unset unless a sandbox Xray project is available; the export then writes a file instead of posting.
- Add the seven files in `.devin/playbooks/` as playbooks in Devin with the triggers in their first line.
- Open the sample app in a browser tab and a mobile viewport tab.

## Moment 1: from a story to tests in Xray (15 min)

Start by showing the app and the accounts screen in the browser, then show `e2e/online-banking-e2e/tests/transfer.spec.ts` with its Xray annotations and `xray/test-cases.example.json` as the manual cases they came from.

Start a session:

```
!generate-e2e-tests Repository <org>/santander-uk-qa-reference, e2e suite in e2e/online-banking-e2e.
Environment http://localhost:3000 (start it from the repo). Scope: the statement screen.
Add a manual test case and an automated test for "a debit transaction is shown in red with a negative amount"
and "the statement shows the balance that the accounts screen showed". Draft the Xray cases in
xray/test-cases.draft.json since we have no Xray sandbox.
```

While it runs, walk the playbook text and point at the steps it is on. End on the pull request: page object unchanged, two new tests, run report attached, Xray draft.

## Moment 2: test data (5 min)

Open `test-data/personas.json` and `test-data/README.md` side by side, then show the fixture in `fixtures/index.ts` resetting the app before each test. Ask Devin for a persona that does not exist:

```
!prepare-test-data We need a user whose current account is exactly at the daily limit so a transfer
one pound over is rejected with the limit message. Add the persona, regenerate the seed, add the test.
```

The point to make is that the data is code in the same pull request as the test, and the generator is deterministic.

## Moment 3: CI fails, Devin repairs (10 min)

Explain `LOCATOR_DRIFT`: the product team renamed the confirm button's test id. Run `LOCATOR_DRIFT=1 npm run test:desktop` live, or show the earlier run: three transfer tests fail on `transfer-submit`. Show `.github/workflows/devin-fix-failing-e2e.yml` as the trigger, then start the repair session by hand:

```
!repair-failing-e2e Repository <org>/santander-uk-qa-reference, branch main. Run the desktop project with
LOCATOR_DRIFT=1 to reproduce. Classify the failures and fix what belongs to the suite.
```

Expected result: one line changed in `pages/TransferPage.ts`, a note in the pull request asking the app team to keep `data-testid` stable, and the classification of each failure. Point out that a product defect would have produced a comment on the pull request, with the assertion left as it was.

## Moment 4: Talos to Playwright (10 min)

Open `legacy/pytalos-disputes/features/disputes.feature` together with the step file, and start the session:

```
!migrate-talos-to-playwright Source legacy/pytalos-disputes. Destination e2e/online-banking-e2e.
Plain Playwright tests, keep the TC tags as Xray annotations. The dispute screens do not exist in the
sample app, so stop after the inventory table and the page object draft and list what the app is missing.
```

Show the inventory table: every scenario accounted for, every locator rewritten against the live page, and the list of what the environment lacks.

## Closing

Return to the pilot plan slide in the deck, where the ask is two applications, a test environment Devin can reach, a Jira project with Xray, and a day on site.
