# QA automation playbooks

Seven playbooks that together cover the flow the team described: point Devin at an application, get test cases into Xray and automation into the end-to-end repository, run it in CI before QA, and keep it green as the application changes.

| Trigger | Playbook | Use it when |
| --- | --- | --- |
| `!qa-pilot` | 07 QA automation pilot orchestrator | Starting on a newly nominated application. Chooses and runs the others. |
| `!generate-e2e-tests` | 01 Generate end-to-end tests | Stories are ready and a suite exists to add tests to. |
| `!prepare-test-data` | 02 Prepare test data | A scenario needs data that is prepared by hand today. |
| `!create-playwright-suite` | 03 Create a Playwright suite | The repository has no automated end-to-end tests. |
| `!migrate-talos-to-playwright` | 04 Migrate a Talos suite | The tests exist in Talos and need to move. |
| `!repair-failing-e2e` | 05 Repair failing end-to-end tests | A CI run failed on a pull request. CI starts it in most cases. |
| `!mobile-app-e2e` | 06 Native mobile end-to-end | The application is a native iOS or Android app. |

How they connect:

```
!qa-pilot (parent session)
  ├─ scan repos, pick the path per surface, confirm access
  ├─ !prepare-test-data                     personas and fixtures
  ├─ per feature batch (child sessions)
  │     ├─ !create-playwright-suite         if no suite
  │     ├─ !migrate-talos-to-playwright     if Talos
  │     └─ !generate-e2e-tests              stories -> Xray cases -> tests -> PR
  ├─ !mobile-app-e2e                        native surfaces, then the same three
  └─ CI wiring
        └─ on failure: !repair-failing-e2e  fix locators / data, report defects
```

## Origins

The procedures were written for this engagement and follow patterns from other engagements, listed here without customer names:

- A global investment bank: bootstrap a BDD test framework in a service module, write functional API tests from Jira stories, then turn the session into a reusable playbook. The "conventions first, then tests, then playbook" order in 01 and 03 comes from there.
- A life sciences company: Playwright tests generated from repository and Jira context, with an automated fixer for failures. That is the split between 01 and 05.
- A marine software company: targeted test runs triggered from Jira or a branch, with results posted back to the ticket or merge request. That is the CI and Xray loop in 01, 05 and 07.
- A quick service restaurant group: one central Playwright framework onboarded across many markets. That is why 03 insists on a single convention set and a README that gets a new engineer running in minutes.
- A professional services firm: a test suite generation playbook created from one exemplar session and later triggered from ticket and pull request stages, with Jira write access, environment access, IP allowlisting and integration approval named as prerequisites. Those prerequisites are the access check in 07.
- A retailer: a proposal structured as application analysis, automation strategy, human validation, then integration and end-to-end test development. That is the shape of 07.
- Santander Mexico: the Talos to Playwright migration and net-new Playwright creation are live workstreams there, and 04 and 03 are written so the same playbooks serve both countries.

## Using them

Each file follows the structure Devin's playbooks use (Overview, What's Needed From User, Procedure, Specifications) and can be pasted into Devin's playbook editor as is. The reference repository carries the same files under `.devin/playbooks/` next to the skills they rely on, so the pilot can start with the sample application before pointing at a real one.
