---
name: repair-locators
description: Diagnose a failing Playwright test and decide whether it is a locator change, a data problem or a product defect before touching anything. Use when a CI e2e run fails.
---

# Repair locators

1. Read the failure from `test-results/<test>/error-context.md` and the trace (`npx playwright show-trace <trace.zip>`), and treat the assertion message as a starting point only.
2. Classify each failure:
   - Locator: the element exists with a different test id, role or text. Fix the page object in `pages/`, nowhere else.
   - Data: the persona no longer matches the seed or the environment. Fix in `test-data/personas.json` and regenerate.
   - Product defect: the element or behaviour is gone or wrong. Do not change the test. Comment on the pull request with the step, the screenshot and the expected result.
3. Prefer `getByTestId`, then `getByRole` with a name, then text. Never a generated CSS path or an index-based XPath.
4. Re-run only the failing spec, then the whole project, and keep the new trace as evidence in the pull request.
5. If the same locator has changed more than once, propose a `data-testid` contract to the app team in the pull request description.
