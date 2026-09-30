import type { Locator } from "@playwright/test";
import { test, expect, users } from "../fixtures";

// JD-140 "Statement shows what happened to my money". The app renders debits
// in the brand red (--red: #ec0000); anything else is the default ink colour.
const DEBIT_RED = "rgb(236, 0, 0)";
const money = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);

test.describe("Statement: what happened to my money", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.login(users.happyPath.username, users.happyPath.password);
  });

  test("a debit is shown in red with a negative amount @smoke", { annotation: { type: "xray", description: "JD-140-TC1" } }, async ({ accountsPage }) => {
    await accountsPage.openAccount(0);
    await expect(accountsPage.statement).toBeVisible();

    const rows = await accountsPage.transactionRows.all();
    const debits: Locator[] = [];
    for (const row of rows) {
      const amount = accountsPage.amountOf(row);
      if ((await amount.innerText()).startsWith("-")) debits.push(amount);
    }
    expect(debits.length, "the seeded account has at least one debit").toBeGreaterThan(0);

    for (const amount of debits) {
      await expect(amount).toHaveText(/^-£\d[\d,]*\.\d{2}$/);
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
    await accountsPage.openAccount(0);
    await expect(accountsPage.statement).toBeVisible();

    const rows = await accountsPage.transactionRows.all();
    const credits: Locator[] = [];
    for (const row of rows) {
      const amount = accountsPage.amountOf(row);
      if (!(await amount.innerText()).startsWith("-")) credits.push(amount);
    }
    expect(credits.length, "the seeded account has at least one credit").toBeGreaterThan(0);

    for (const amount of credits) {
      await expect(amount).toHaveText(/^£\d[\d,]*\.\d{2}$/);
      await expect(amount).not.toHaveCSS("color", DEBIT_RED);
    }
  });
});
