# Test data

`personas.json` is the hand-maintained list of test users and the accounts they hold. `generate.js` turns it into `seed.json`, which the sample app loads at start and resets on `POST /api/reset`.

Personas and why they exist:

| Persona | Purpose |
| --- | --- |
| `demo.user` | Happy path. Two accounts, enough balance for transfers. |
| `low.balance` | Insufficient funds and daily limit errors. |
| `locked.user` | Locked account message on login. |

Regenerate after editing personas:

```bash
node test-data/generate.js
```

The same shape (persona file in, deterministic seed out) is what the test data preparation playbook produces for a real application, with an anonymised extract or synthetic data as the source.
