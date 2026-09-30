# Migrate a Talos suite to Playwright

Trigger: `!QA_migrate_talos_to_playwright`

## Overview

Convert an existing suite built on the Talos framework (Gherkin features with Python step definitions over Selenium, per-environment profiles) into Playwright TypeScript, keeping the scenarios and their traceability to manual test cases while replacing the execution layer. Talos support is being withdrawn, so the aim is that nothing the old suite covered is lost, and the new suite follows the same conventions as suites created from scratch.

## What's Needed From User

- The Talos repository and the profile (environment) the scenarios currently run against.
- Whether the scenarios still reflect the application (a suite that has not run green for months needs a triage step first).
- The destination: an existing Playwright repository to extend or a new one to create with the `create-playwright-suite` playbook.
- Whether the team wants to keep Gherkin (Playwright with a BDD layer) or move to plain Playwright tests. Plain tests are the default.
- Mapping from scenario tags to Xray keys, if the tags are the traceability today.

## Procedure

1. Inventory the Talos suite: every feature file, scenario and scenario outline, the step definitions each uses, the tags, and the profile values referenced. Produce a table with one row per scenario and its tags.
2. Run or read the last results of the old suite. Mark each scenario as passing, failing for a known reason, or stale. Stale scenarios are listed for the user to keep or drop before any are converted.
3. Read the destination repository conventions (or create the skeleton with the `create-playwright-suite` playbook).
4. Build the page objects first: collect every Selenium locator from the step definitions, group them by screen, and replace each with a Playwright locator against the live application (test id or role, found in the live page). Record locators that had to change because the old ones no longer resolve.
5. Convert scenarios in batches by feature. Each Gherkin scenario becomes one test; a scenario outline becomes a parameterised loop over its examples. The test title is the scenario name, the tag becomes the Xray annotation, and `Background` steps become a fixture or `beforeEach`.
6. Replace profile values with the suite's environment variables and personas. Secrets referenced by the profile move to the secret store.
7. Run each converted batch against the environment. Where a converted test fails and the old scenario passed, check the locator before the logic; where both fail, record it as a candidate product defect and leave the assertion as the scenario specified.
8. Remove the converted features from the Talos suite only when the user asks; the default is to leave the old suite untouched and mark converted scenarios in the inventory table.
9. Open one pull request per feature batch in the destination repository with the inventory table, the run report, and the list of scenarios converted, dropped and blocked.

## Specifications

- One scenario becomes one test; no scenario is silently merged or split.
- Assertions preserve the old expected results word for word unless the user approves a change.
- Locators are rewritten: an XPath in the Python step is a prompt to find the stable attribute in the live page.
- Every converted test carries the Xray key (or the old tag when there is no key yet) in its annotation.
- Converted tests pass on the target environment before the pull request is opened, or carry a note with the blocking reason.
- The inventory table is committed alongside the tests so progress can be read without opening both repositories.
