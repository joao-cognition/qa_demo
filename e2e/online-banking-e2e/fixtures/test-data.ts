import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// The e2e repo reads the same persona file the app is seeded from, so a test
// never hard-codes a balance that the seed later changes.
type Persona = {
  username: string;
  password: string;
  name: string;
  locked?: boolean;
  accounts: { name: string; number: string; balance: number; dailyLimit?: number }[];
};

const personas: Persona[] = JSON.parse(
  readFileSync(resolve(__dirname, "../../../test-data/personas.json"), "utf8"),
);

export const users = {
  happyPath: personas.find((p) => p.username === "demo.user")!,
  lowBalance: personas.find((p) => p.username === "low.balance")!,
  locked: personas.find((p) => p.username === "locked.user")!,
};

// Statement rows the migrated disputes scenarios act on. Descriptions come from
// the merchants list in test-data/generate.js, so the seed and the specs agree.
export const disputeTransactions = {
  debit: "Amazon",
  secondDebit: "Tesco",
  credit: "Salary",
  reason: "I did not make this purchase",
};
