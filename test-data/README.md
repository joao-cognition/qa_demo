# Test data

`personas.json` is the hand-maintained list of test users and the accounts they hold. `generate.js` turns it into `seed.json`, which the sample app loads at start and resets on `POST /api/reset`.

Personas and why they exist:

| Persona | Purpose |
| --- | --- |
| `demo.user` | Happy path. Two accounts, enough balance for transfers. |
| `low.balance` | Insufficient funds and daily limit errors. |
| `locked.user` | Locked account message on login. |
| `daily.limit` | Daily limit boundary (JD-141). Current account balance 1500 above a 1000 limit, so a transfer of exactly the limit is accepted and one pound over is rejected with `Daily limit is 1000` rather than `Insufficient funds`. Second account is the destination. |

Regenerate after editing personas:

```bash
node test-data/generate.js
```

The same shape (persona file in, deterministic seed out) is what the test data preparation playbook produces for a real application, with an anonymised extract or synthetic data as the source.
