import { test, expect, users } from "../fixtures";

test.describe("Move money", () => {
  test("transfer between own accounts updates the balance @smoke", { annotation: { type: "xray", description: "BANK-301" } }, async ({ loginPage, accountsPage, transferPage }) => {
    await loginPage.login(users.happyPath.username, users.happyPath.password);
    await accountsPage.transferTab.click();
    await transferPage.transfer({ fromIndex: 0, toIndex: 1, amount: "100", reference: "Savings top up" });
    await expect(transferPage.success).toContainText("Transfer of £100.00 sent");
    const newBalance = users.happyPath.accounts[0].balance - 100;
    await expect(transferPage.success).toContainText(
      new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(newBalance),
    );
  });

  test("insufficient funds is rejected with a clear message", { annotation: { type: "xray", description: "BANK-302" } }, async ({ loginPage, accountsPage, transferPage }) => {
    await loginPage.login(users.lowBalance.username, users.lowBalance.password);
    await accountsPage.transferTab.click();
    await transferPage.transfer({ fromIndex: 0, toIndex: 0, amount: "50" });
    await expect(transferPage.error).toHaveText("Insufficient funds");
  });

  test("zero amount is rejected", { annotation: { type: "xray", description: "BANK-303" } }, async ({ loginPage, accountsPage, transferPage }) => {
    await loginPage.login(users.happyPath.username, users.happyPath.password);
    await accountsPage.transferTab.click();
    await transferPage.transfer({ fromIndex: 0, toIndex: 1, amount: "0" });
    await expect(transferPage.error).toHaveText("Enter an amount greater than zero");
  });
});
