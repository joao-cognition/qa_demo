# Generate end-to-end tests from an application and its stories

Trigger: `!QA_generate_e2e_tests`

## Overview

Take an application that is deployed to a test environment, together with the Jira stories (and Figma frames where they exist) that describe what it should do, and produce manual test cases in Xray that the QA team can read and approve, plus the automated tests that implement them in the team's end-to-end repository. The tests are written against the current application, so locators reflect what is actually rendered, and every automated test is linked to its Xray test case so results flow back to Jira.

This playbook is the parent of the flow. It calls the test data preparation playbook when a scenario needs data that does not exist, and it hands over to the repair playbook once the suite is in CI.

## What's Needed From User

- Application under test: URL of the test environment and how to log in (test user held in the secret store).
- Scope: Jira story keys, or the screens or journeys to cover if there are no stories yet.
- The end-to-end repository the tests belong in, and the framework it uses (Playwright TypeScript is the default in the reference repository; WebdriverIO plus Appium for native mobile).
- Jira project and Xray test plan the test cases should be created in, and whether Devin may create Xray issues or should draft them in a file for a human to create.
- Figma file or frames, if the team wants expected states checked against design.
- Anything Devin must not do in this environment (payments that leave the sandbox, emails to real addresses, data deletion).

## Procedure

1. Read the stories and any linked Figma frames. Write one line per acceptance criterion and list the screens each one touches. Ask for a decision where a criterion is ambiguous.
2. Open the application at the given URL with the test user and walk every screen in scope. Record the stable locators available on each screen (test ids, roles with names, labels). Note where none exist; that list becomes a request to the application team.
3. Read the end-to-end repository: framework, folder layout, page object conventions, fixtures, how test data is loaded, how results are reported. Follow those conventions exactly; do not introduce a second pattern.
4. Draft the manual test cases: summary, precondition, numbered steps, expected result, one per acceptance criterion plus the negative paths the criterion implies. Cover the happy path, validation errors, and permission or state boundaries.
5. Create the test cases in Xray under the given test plan (or write them to `xray/test-cases.draft.json` if creation is reserved for humans) and link each one to its story. Keep the returned keys.
6. Check each test case against the test data available. For every scenario that needs data that does not exist, run the `prepare-test-data` playbook (or its skill) so the persona exists in the fixture before the test is written.
7. Write the automated tests. One page object per screen, locators only in page objects, one automated test per Xray test case, with the Xray key in the test's annotation. Reuse the repository's fixtures for login and reset.
8. Run the suite locally against the environment on every project the repository defines (desktop, mobile viewports, or device cloud). Fix failures that belong to the test. For failures that look like product defects, keep the test and record the evidence.
9. Run the results export so the Xray test cases show the execution outcome, then open a pull request in the end-to-end repository. The description lists the stories, the Xray keys, the locators that need a stable contract from the application team, and any suspected defects with trace or screenshot evidence.
10. Post a comment on each Jira story linking the pull request and the Xray test cases.

## Specifications

- Locator preference in order: test id, role with accessible name, label, visible text. Never generated CSS paths or index based XPath.
- Every automated test is independent: it logs in itself, uses its own persona, and leaves no state another test depends on.
- Test names read as the manual test case does ("insufficient funds is rejected with a clear message"), tagged `@smoke` where the case is part of the deployment gate.
- Assertions check what the user sees: message text, balance, row count.
- Evidence attached to the pull request: HTML report and the trace of any failing or flaky test.
- No credentials, tokens or personal data in the repository, in the prompt, or in Jira comments.
- The pull request is the deliverable. Devin does not merge.
