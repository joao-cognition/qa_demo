import { test, expect, users, seededTransactions } from "../fixtures";

// JD-140 "Statement shows what happened to my money". The app renders debits
// in the brand red (--red: #ec0000); anything else is the default ink colour.
// The seed (not the rendered sign) decides which rows are debits and credits.
const DEBIT_RED = "rgb(236, 0, 0)";
const money = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);
const account = users.happyPath.accounts[0];
const seeded = seededTransactions(account);

test.describe("Statement: what happened to my money", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.login(users.happyPath.username, users.happyPath.password);
  });

  test("a debit is shown in red with a negative amount @smoke", { annotation: { type: "xray", description: "JD-140-TC1" } }, async ({ accountsPage }) => {
    const debits = seeded.map((t, i) => ({ ...t, row: i })).filter((t) => t.amount < 0);
    expect(debits.length, "the seeded account has at least one debit").toBeGreaterThan(0);

    await accountsPage.openAccount(0);
    await expect(accountsPage.statement).toBeVisible();
    await expect(accountsPage.transactionRows).toHaveCount(seeded.length);

    for (const debit of debits) {
      const amount = accountsPage.amountOf(accountsPage.transactionRows.nth(debit.row));
      await expect(amount).toHaveText(money(debit.amount));
      await expect(amount).toHaveText(/^-£/);
      await expect(amount).toHaveCSS("color", DEBIT_RED);
    }
  });

  test("the statement header shows the balance the accounts screen showed @smoke", { annotation: { type: "xray", description: "JD-140-TC2" } }, async ({ accountsPage }) => {
    for (const [index, account] of users.happyPath.accounts.entries()) {
      await expect(accountsPage.list).toBeVisible();
      const shownOnAccounts = await accountsPage.balances.nth(index).innerText();
      expect(shownOnAccounts).toBe(money(account.balance));

      await accountsPage.openAccount(index);
      await expect(accountsPage.statement).toBeVisible();
      await expect(accountsPage.statementBalance).toHaveText(shownOnAccounts);

      await accountsPage.backToAccounts.click();
    }
  });

  test("a credit is shown without a minus sign and not in red", { annotation: { type: "xray", description: "JD-140-TC3" } }, async ({ accountsPage }) => {
    const credits = seeded.map((t, i) => ({ ...t, row: i })).filter((t) => t.amount > 0);
    expect(credits.length, "the seeded account has at least one credit").toBeGreaterThan(0);

    await accountsPage.openAccount(0);
    await expect(accountsPage.statement).toBeVisible();
    await expect(accountsPage.transactionRows).toHaveCount(seeded.length);

    for (const credit of credits) {
      const amount = accountsPage.amountOf(accountsPage.transactionRows.nth(credit.row));
      await expect(amount).toHaveText(money(credit.amount));
      await expect(amount).toHaveText(/^£/);
      await expect(amount).not.toHaveCSS("color", DEBIT_RED);
    }
  });
});
