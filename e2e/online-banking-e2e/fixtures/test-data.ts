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

// seed.json is generated deterministically from personas.json (node test-data/generate.js)
// and is what the app loads on reset, so it is the oracle for what a statement must show.
type SeedAccount = { id: string; number: string };
export type SeedTransaction = { id: string; accountId: string; date: string; description: string; amount: number };

const seed: { accounts: SeedAccount[]; transactions: SeedTransaction[] } = JSON.parse(
  readFileSync(resolve(__dirname, "../../../test-data/seed.json"), "utf8"),
);

// Transactions in the order the app serves them for the given persona account.
export function seededTransactions(account: Persona["accounts"][number]): SeedTransaction[] {
  const acct = seed.accounts.find((a) => a.number === account.number)!;
  return seed.transactions.filter((t) => t.accountId === acct.id);
}
