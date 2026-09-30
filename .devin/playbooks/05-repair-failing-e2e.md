# Repair failing end-to-end tests before the work reaches QA

Trigger: `!QA_repair_failing_e2e`

## Overview

When an end-to-end run fails on a pull request, work out for each failure whether the test broke (a locator changed, a wait is wrong, the data moved) or the product broke, fix what belongs to the suite, and push the fix to the same pull request with evidence. Product defects are reported on the pull request with the failing step and the screenshot, and the test is left as it is. The developer sees a green or an explained red before QA is involved.

This is the playbook that keeps a generated suite alive, and the one most often triggered automatically from CI.

## What's Needed From User

- The failing run: CI run URL or the report artifact, the repository and branch.
- Where the suite lives if it is a different repository from the application.
- Permission to push to the pull request branch (default) or to open a separate pull request against it.
- The environment the run used and how to reach it from Devin, so failures can be reproduced.
- Who to mention on the pull request for product defects.

## Procedure

1. Download the run's report and traces. Read `error-context.md` and the trace for every failure.
2. Reproduce each failure locally against the same environment. A failure that does not reproduce twice is flakiness and is treated as a test problem.
3. Classify every failure as locator, timing, data, environment, or product defect, with one sentence of evidence each.
4. Locator failures: find the element's current stable attribute in the live application and change the page object only. If the attribute is generated or missing, add a request for a `data-testid` to the pull request description.
5. Timing failures: replace fixed waits with a condition on the state the test needs (element visible, request completed, text present).
6. Data failures: fix the persona or the setup call so the fixture creates the state, following the test data playbook. Never edit the expected value to match whatever the environment happens to hold.
7. Environment failures (unreachable host, expired certificate, missing secret): stop, report what is missing and how to grant it, and do not change tests.
8. Product defects: keep the test unchanged. Comment on the pull request with the Xray test key, the step that failed, the screenshot, the expected result and the observed result, and mention the named owner.
9. Re-run the failing specs, then the full project the failure came from. Push the fix to the pull request branch with a commit message that lists the failure classes.
10. Update the Xray execution through the export so the test cases reflect the new outcome.

## Specifications

- Only page objects and fixtures change for locator and data failures; test assertions change only with the user's approval.
- Each fix commit references the CI run it repairs.
- Evidence for every classification: a trace or screenshot path in the pull request comment.
- A product defect is never worked around by widening an assertion or adding a retry.
- Retries stay at the repository's configured value.
- If more than a third of the suite fails for the same locator reason, stop and propose a locator contract with the application team instead of patching each test.
