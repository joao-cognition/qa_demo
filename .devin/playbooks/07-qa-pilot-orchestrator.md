# QA automation pilot: orchestrate the playbooks on one application

Trigger: `!QA_pilot`

## Overview

Run the full flow on a nominated application in one pass: check the application and its repositories, decide which playbooks apply (create a suite, migrate one, or extend one), prepare test data, generate tests and Xray cases, put them in CI, and hand the repair playbook to CI for what follows. Where work can run in parallel (one feature per child session, or web and mobile at once), start child sessions with the relevant playbook and collect their pull requests. The output is a set of reviewable pull requests plus a short status the team can read in Jira.

## What's Needed From User

- The nominated application: repositories (application and end-to-end), test environment URL, test user in the secret store.
- The Jira project, stories in scope, and the Xray test plan.
- Which surfaces are in scope: web desktop, mobile web, native Android, native iOS.
- Who reviews pull requests in the end-to-end repository and who owns product defects.
- Limits: which environments Devin may write to, whether Devin may create Xray issues, and how many parallel sessions to run.

## Procedure

1. Scan the application and end-to-end repositories. Record: framework in use, whether a Playwright suite exists, whether a Talos suite exists, how test data is prepared today, how results reach Jira, and how CI runs tests. Write this as a one page baseline in the end-to-end repository.
2. Choose the path per surface: no suite means `create-playwright-suite`; a Talos suite means `migrate-talos-to-playwright`; an existing suite means `generate-e2e-tests` directly. Native mobile always goes through `mobile-app-e2e` first.
3. Confirm access before starting work: environment reachable from Devin, test user works, Jira and Xray reachable through the approved integration, CI secrets in place. Report anything missing in one message and stop until it is fixed.
4. Run `prepare-test-data` once for the personas the stories in scope need.
5. Split the stories into batches by feature. For each batch start a child session with `generate-e2e-tests` (or the migration playbook), the batch of stories, and the shared personas. Keep to the agreed parallel limit.
6. Collect the child sessions' pull requests. Check that each one follows the repository conventions, carries Xray keys, and includes a run report; send back anything that does not.
7. Add or update the CI workflows: run the suite on pull requests, publish to Xray, start `repair-failing-e2e` on failure.
8. Post one comment on the Jira epic (or the pilot ticket) with the baseline, the pull requests, the Xray test plan link, the locator contract requests for the application team, and the open blockers.
9. Once the first pull requests are merged, trigger one deliberate failure (a renamed test id on a branch) to show the repair loop end to end, and record the result.

## Specifications

- Child sessions each own one batch and one pull request; the parent does not edit their code, it reviews and routes.
- Every pull request is against the end-to-end repository unless the team asks for the suite to live alongside the app.
- The baseline document names every repository, environment and integration touched, so the pilot can be repeated on the next application by changing that file.
- Secrets live in the secret store only; the playbook text never contains them.
- Devin does not merge or change CI branch protection.
