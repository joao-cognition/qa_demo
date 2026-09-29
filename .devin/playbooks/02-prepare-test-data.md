# Prepare test data for a test scenario

Trigger: `!prepare-test-data`

## Overview

Produce the data a test scenario needs (users, accounts, transactions, feature flags, whatever the application's domain calls for) in a form that is reproducible, checked into the end-to-end repository, and loaded by the test itself. Preparing data by hand before a run costs QA teams more time than any other step, and this playbook turns that step into code that runs every time.

## What's Needed From User

- The scenario or test cases the data is for.
- Where test data comes from today: a database extract, a shared spreadsheet, API calls against the test environment, a synthetic generator, or people setting it up by hand.
- Which of those sources Devin may read from and write to, with access set up in the secret store (read only database user, API client, service account).
- Rules on personal data: whether extracts must be anonymised and which fields count as personal.
- The environment reset or teardown mechanism, if one exists.

## Procedure

1. List the data every scenario needs as facts ("a user with two accounts, one below 50 GBP", "a locked user"). Group facts into personas.
2. Look at how the end-to-end repository loads data today. If a persona file or fixture exists, extend it; if not, create `test-data/personas.json` (or the framework's equivalent) and a fixture that exposes it to tests.
3. Choose the source per persona, in this order of preference: synthetic data generated from the persona file; API calls against the test environment that create the state; an anonymised extract. Direct production reads are out of scope.
4. Write the generator or setup calls so they are deterministic (fixed seed, fixed ids) and idempotent (running twice yields the same state).
5. Where an extract is unavoidable, write the anonymisation step alongside it (names, identifiers, contact details replaced; amounts and dates kept), and check the output against the personal data rules before committing anything.
6. Wire the data into the tests: a fixture resets or creates the state before each test, and tests read values from the persona file.
7. Run the affected tests twice in a row. Both runs must pass with identical results; if the second differs, the setup is leaking state.
8. Document each persona in one line (what it is for) in the test data README, and open a pull request.

## Specifications

- The persona file is the single source of truth; the seed or state it produces is always generated from it.
- Generators are seeded and produce byte identical output for the same input.
- No production identifiers, contact details or credentials in the repository.
- Fixtures fail loudly when the environment does not match the persona (missing user, different balance), with a message that names the persona.
- Where the application has a reset endpoint or a database snapshot, the fixture calls it; where it does not, the pull request proposes one to the application team.
