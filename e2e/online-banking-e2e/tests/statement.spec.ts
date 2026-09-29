import { test, expect, users } from "../fixtures";

test.describe("Statement", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.login(users.happyPath.username, users.happyPath.password);
  });

  test("account balances match the seeded data @smoke", { annotation: { type: "xray", description: "BANK-201" } }, async ({ accountsPage }) => {
    const expected = users.happyPath.accounts.map((a) =>
      new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(a.balance),
    );
    await expect(accountsPage.balances).toHaveText(expected);
  });

  test("opening an account lists its transactions", { annotation: { type: "xray", description: "BANK-202" } }, async ({ accountsPage }) => {
    await accountsPage.openAccount(0);
    await expect(accountsPage.statement).toBeVisible();
    await expect(accountsPage.transactionRows.first()).toBeVisible();
    expect(await accountsPage.transactionRows.count()).toBeGreaterThan(0);
  });
});
