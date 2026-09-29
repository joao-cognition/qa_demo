---
name: xray-sync
description: Map automated tests to Xray test cases and publish run results. Use when creating tests for Jira stories or after an e2e run that should update Xray.
---

# Xray sync

The mapping lives in the tests themselves: every `test(...)` carries `{ annotation: { type: "xray", description: "<TEST KEY>" } }`.

1. When drafting a new test case, create the Xray Test issue first (through the Jira/Xray MCP or the Xray REST API with the CI secrets) using the shape in `e2e/online-banking-e2e/xray/test-cases.example.json`: summary, precondition, steps, expected result. Link it to the story.
2. Put the returned key in the spec's annotation. One key per automated test.
3. After a run, `npm run xray:export` converts `test-results/results.json` into an Xray import payload. Without `XRAY_CLIENT_ID` and `XRAY_CLIENT_SECRET` it writes `xray/last-export.json` and stops; read that file to check the mapping.
4. In CI the secrets are set, so the same command posts the execution. `XRAY_TEST_PLAN_KEY` attaches it to a plan.
5. Any test the export reports as unmapped needs a key before the pull request is opened.
