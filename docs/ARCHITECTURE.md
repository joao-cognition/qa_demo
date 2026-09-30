# Architecture and what to connect

## Sample to real mapping

| In this sample | In the customer setup | Connection needed |
| --- | --- | --- |
| `apps/online-banking-web` on localhost | Application deployed to a test environment | Network route from Devin to the environment (VPN, allowlist), a test user |
| `e2e/online-banking-e2e` folder | Separate end-to-end repository per application or shared | Git access to both the application and the e2e repository |
| `test-data/personas.json` and `generate.js` | Database extracts, spreadsheets, hand setup | Read access to the test data source, anonymisation rules, a reset mechanism |
| Xray annotation and `xray/export-results.mjs` | Jira with Xray | Jira/Xray integration approved for Devin, a project and test plan, permission to create Test issues |
| Playwright projects for mobile viewports | Native apps on a device cloud | Device cloud credentials, app builds, accessibility identifiers, iOS runner |
| `.github/workflows/*.yml` | The customer's CI | Devin API key in CI secrets, or Devin's native repository integration |
| `.devin/playbooks`, `.agents/skills` | The team's existing playbooks and skills | Review together, keep theirs where they fit |

## Flow

```
Jira story + Figma + application in test env
        │
        ▼
 !QA_generate_e2e_tests ──► Xray test cases ──► Playwright tests (PR in e2e repo)
        │                                            │
        ├── !QA_prepare_test_data (personas, fixtures)   │
        ▼                                            ▼
   CI runs suite on every PR ──► results to Xray ──► fail? ──► !QA_repair_failing_e2e ──► fix or defect comment
```

## Secrets and boundaries

The repository holds no secrets, and the sample runs without any. Test users, Xray client credentials, device cloud keys and the Devin API key live in Devin's secret store and CI secrets. The Xray export and the CI workflows do nothing when their secrets are absent, so the sample runs anywhere.
