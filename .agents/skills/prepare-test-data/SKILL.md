---
name: prepare-test-data
description: Add or change test personas and regenerate the deterministic seed the app and the tests share. Use when a new test needs data that does not exist yet.
---

# Prepare test data

1. Every test reads its data from `test-data/personas.json` through `e2e/online-banking-e2e/fixtures/test-data.ts`. Never hard-code balances or usernames in a spec.
2. To add a scenario, add a persona (or an account on an existing one) with the smallest set of fields that makes the scenario true, and a one-line reason in `test-data/README.md`.
3. Run `node test-data/generate.js`. The generator is seeded, so the same personas always produce the same `seed.json`.
4. The app reloads the seed on `POST /api/reset`, which the fixtures call before every test. If a test depends on state created by another test, it is wrong; give it its own persona.
5. For a real application the same pattern applies with the source swapped: an anonymised extract, a synthetic generator, or a set of API calls against the test environment that create the state, all run from the fixture.
