# Create a Playwright suite where none exists

Trigger: `!create-playwright-suite`

## Overview

Stand up a Playwright TypeScript suite for a web application (or a web view inside a mobile app) that has no automated end-to-end tests, with the structure the team will keep: configuration for the environments and viewports in use, page objects, fixtures, test data, reporting, a CI job, and a first set of tests covering the critical journeys. The output is a repository (or folder in the shared end-to-end repository) the QA team can extend without redoing the foundations.

## What's Needed From User

- Application URL for at least one test environment and a test user in the secret store.
- Where the suite should live: a new repository, or a folder in an existing end-to-end repository, and the naming convention.
- The three to six critical journeys to cover in the first pull request. Login, the main read screen and the main transaction are the usual set.
- Target surfaces: desktop browsers, mobile viewports, or a device cloud, and which browsers matter.
- CI system and where secrets are held.
- Reporting destination (Xray, a dashboard, the pull request only).

## Procedure

1. Read the application: framework, routing, how screens are rendered, what stable attributes exist for locators. Take screenshots of each screen in scope for the record.
2. Create the suite skeleton: `package.json` with pinned Playwright, `playwright.config.ts` with one project per surface, `pages/` for page objects, `fixtures/` for login and data, `tests/`, `test-data/` reference, and a README that says how to run it. The reference repository's `e2e/online-banking-e2e` is the template.
3. Configure `baseURL` from an environment variable with the local default, `webServer` for local runs only, trace and screenshot on failure, an HTML reporter and a JSON reporter for the Xray export.
4. Write the page objects for the screens in scope. Locators live only here.
5. Add the fixtures: authenticated page, data reset, personas. Call the test data playbook for any persona that does not exist.
6. Cover the critical journeys with the first tests for the critical journeys, one file per feature, each test independent and named after the behaviour it checks. Add the Xray annotation where a test case exists.
7. Run the suite on every project. Fix flakiness at the root by waiting on a state such as an element being visible or a request completing.
8. Create the CI workflow that installs browsers, runs the suite on pull requests, uploads the report, and publishes to Xray when the secrets are present.
9. Commit the skill file that explains how to run the suite locally, and the locator contract the application team is asked to keep (`data-testid` on interactive elements).
10. Open the pull request with the run report attached and the list of journeys covered and deliberately left out.

## Specifications

- Playwright version pinned; browsers installed in CI with `--with-deps`.
- Projects named by surface (`desktop-chromium`, `mobile-android`, `mobile-ios`), device descriptors from Playwright's list.
- `workers` and `retries` set explicitly; retries only in CI and never above 1 without a note explaining why.
- No test reaches into another test's state; no `test.only` or skipped tests in the pull request.
- Report artifacts are uploaded on failure and on success.
- The README gets a new engineer from clone to a green run in under ten minutes.
