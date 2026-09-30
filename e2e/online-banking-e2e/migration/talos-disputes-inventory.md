# Talos → Playwright migration inventory: `legacy/pytalos-disputes`

Story: [JD-148](https://cog-gtm.atlassian.net/browse/JD-148) — Migrate the disputes Talos suite to Playwright.
Source: `legacy/pytalos-disputes` (Behave + Selenium, profile `sit`). Destination: `e2e/online-banking-e2e` (plain Playwright, no BDD layer).

Status: **stopped after inventory and page-object draft** (AC3). `apps/online-banking-web` has no dispute screen and no dispute API (`server.js` serves `/api/login`, `/api/accounts`, `/api/accounts/:id/transactions`, `/api/transfers`, `/api/reset` only; `public/app.js` renders log on, accounts, statement, transfer). The migrated specs exist in `tests/disputes.spec.ts` as `test.fixme(...)` so the suite stays green and the Xray export still sees the keys.

## Old suite results

The legacy suite is not run in this repository (`legacy/pytalos-disputes/README.md`: "It is a migration source and is not run here"), so no last result is available. Profile `sit.cfg` points at `https://sit.bank.example`, which does not resolve. All three scenarios are therefore classified **stale: cannot be executed**; none was dropped, the user decides after the app team delivers the screens.

## Scenarios

| Talos tag | Scenario | Type | Steps used | Data | Xray key (draft) | Playwright test | Page object | Status |
|---|---|---|---|---|---|---|---|---|
| `@TC-DISP-001 @smoke` | Raise a dispute on a card transaction | Scenario | login, open statement, select tx, choose option, pick reason, confirm, see message, row label | account `Everyday Current Account`, merchant `Amazon`, reason `I did not make this purchase`, message `Your dispute has been raised`, label `Disputed` | `JD-148-TC1` | `tests/disputes.spec.ts` › "Raise a dispute on a card transaction @smoke" | `DisputesPage` | converted → **fixme** (no dispute screens) |
| `@TC-DISP-002` | Cannot dispute a credit | Scenario | login, open statement, select tx, option not available | account `Everyday Current Account`, merchant `Salary` (credit) | `JD-148-TC2` | `tests/disputes.spec.ts` › "Cannot dispute a credit" | `DisputesPage` | converted → **fixme** (no dispute screens; rows not selectable) |
| `@TC-DISP-003` | Reason is mandatory | Scenario Outline (2 examples) | login, open statement, select tx, choose option, confirm, see validation | account `Everyday Current Account`, merchant `Amazon` / `Tesco`, validation `Choose a reason` | `JD-148-TC3` (one key, both examples) | `tests/disputes.spec.ts` › "Reason is mandatory (Amazon)", "Reason is mandatory (Tesco)" | `DisputesPage` | converted → **fixme** (no dispute screens; **data gap**: `Tesco` is not in demo.user's Everyday Current Account seed, only in eSaver) |

Background `Given I log on as "demo.user" with password from profile` → `test.beforeEach` using the existing `loginPage` fixture and `users.happyPath` (persona `demo.user` from `test-data/personas.json`).

Converted: 3 scenarios / 4 tests. Dropped: 0. Blocked: 3 (all on the missing dispute journey). Merged/split: none.

### Traceability keys

The story's AC1 asks to keep `TC-DISP-*` as the annotation, while the pilot convention is `<STORY>-TC<n>` draft keys in `xray/test-cases.draft.json`. Both are kept: the `xray` annotation carries `JD-148-TC<n>` (what the export maps), and a second `talos` annotation carries the original tag. Swapping the two is a one-line change per test if the team prefers the old tags as the Xray keys.

## Profile values → suite equivalents

| `profiles/sit.cfg` | Playwright suite |
|---|---|
| `[env] base_url` | `APP_URL` env var (`playwright.config.ts` `baseURL`; local app started by `webServer`) |
| `[env] browser = chrome` | projects `desktop-chromium`, `mobile-android`, `mobile-ios` |
| `[users] demo.user = <from vault>` | `users.happyPath` from `fixtures/test-data.ts` (personas file; no secret needed for the sample app) |

## Locator rewrite (Selenium → Playwright)

| Step | Selenium locator | Playwright locator | Resolves today? |
|---|---|---|---|
| log on: username | `By.ID "username"` | `LoginPage.username` = `getByTestId("username")` | yes |
| log on: password | `By.ID "password"` | `LoginPage.password` = `getByTestId("password")` | yes |
| log on: submit | `//button[contains(text(),'Log on')]` | `LoginPage.submit` = `getByTestId("login-submit")` | yes |
| log on: landed | `[data-testid='accounts-list']` | `AccountsPage.list` | yes |
| open statement: account card | `//article[contains(., '<account>')]` | `getByTestId("account-card").filter({ hasText })` | yes |
| open statement: landed | `[data-testid='statement']` | `getByTestId("statement")` | yes |
| select transaction | `//tr[td[text()='<merchant>']]` + click | `getByTestId("transaction-row").filter({ hasText })` | row exists; **not clickable, no detail view** → contract request |
| choose option | `//button[text()='Dispute this transaction']` | `getByTestId("dispute-transaction")` | **no** → contract request |
| pick reason | `//label[contains(., '<reason>')]/input` | `getByTestId("dispute-form").getByRole("radio", { name })` | **no** → contract request |
| confirm | `#dispute-form button[type='submit']` | `getByTestId("dispute-submit")` | **no** → contract request |
| success message | `.success` | `getByTestId("dispute-success")` | **no** → contract request |
| validation | `.error` | `getByTestId("dispute-error")` | **no** → contract request |
| row label | `context.selected_row.text` contains `Disputed` | `transactionRow(desc).getByTestId("transaction-status")` | **no** → contract request |

## Locator contract request (to the app team)

Every element the migrated tests need and the app does not provide. Preference order followed: `data-testid` → role/label → text.

| # | Element | Legacy locator | Requested `data-testid` | Notes |
|---|---|---|---|---|
| 1 | Statement row is selectable (opens a transaction detail) | `//tr[td[text()='<merchant>']]` (click) | keep `transaction-row`, make it a `role="button"`/link with `data-transaction-id` | today rows are inert `<tr>` |
| 2 | Transaction detail panel | — | `transaction-detail` | container for the actions below |
| 3 | "Dispute this transaction" button | `//button[text()='Dispute this transaction']` | `dispute-transaction` | must be **absent** (not just disabled) for credits (`amount > 0`) — TC-DISP-002 asserts `count == 0` |
| 4 | Dispute form | `#dispute-form` | `dispute-form` | |
| 5 | Reason options | `//label[contains(., '<reason>')]/input` | `dispute-reason` on each `<input type=radio>` with a `<label>` whose text is the reason, e.g. "I did not make this purchase" | located by role `radio` + accessible name inside `dispute-form` |
| 6 | Confirm button | `#dispute-form button[type='submit']` | `dispute-submit` | |
| 7 | Success message | `.success` | `dispute-success` (`role="status"`) | text must contain "Your dispute has been raised" |
| 8 | Validation message | `.error` | `dispute-error` (`role="alert"`) | text must contain "Choose a reason" when submitted without a reason |
| 9 | Row status badge | row text contains "Disputed" | `transaction-status` inside `transaction-row` | text "Disputed" after a dispute is raised |

API needed alongside (so `fixtures/index.ts` reset keeps working): `POST /api/accounts/:accountId/transactions/:txId/disputes { reason }` → 201 and the transaction gains `status: "disputed"`; 400 `Choose a reason` when reason is empty; 400 when the transaction is a credit; `POST /api/reset` clears disputes.

Test data gap: `TC-DISP-003` example `Tesco` needs a `Tesco` debit in demo.user's `Everyday Current Account`; the deterministic seed currently puts Tesco only in `eSaver`. Options: extend `personas.json`/`generate.js` with explicit transactions for that account, or change the example to a merchant present in the seed (needs user approval as it changes scenario data).

## Old suite

Left untouched per playbook step 8. Converted scenarios are the three above; nothing removed from `legacy/pytalos-disputes`.
