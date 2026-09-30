import { test, expect, users } from "../fixtures";

// JD-141 Daily limit protects the customer. Persona daily.limit keeps its
// current account balance above the limit, so a rejection is caused by the
// limit and not by insufficient funds (the server checks funds first).
const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });
const [current, saver] = users.dailyLimit.accounts;
const limit = current.dailyLimit!;

test.describe("Daily limit", () => {
  test("transfer of exactly the daily limit is accepted @smoke", { annotation: { type: "xray", description: "JD-141-TC1" } }, async ({ loginPage, accountsPage, transferPage }) => {
    await loginPage.login(users.dailyLimit.username, users.dailyLimit.password);
    await accountsPage.transferTab.click();
    await transferPage.transfer({ fromIndex: 0, toIndex: 1, amount: String(limit), reference: "At the limit" });

    await expect(transferPage.success).toHaveText(
      `Transfer of ${gbp.format(limit)} sent. New balance ${gbp.format(current.balance - limit)}.`,
    );
    await expect(transferPage.error).toHaveCount(0);

    await accountsPage.accountsTab.click();
    await expect(accountsPage.balances).toHaveText([
      gbp.format(current.balance - limit),
      gbp.format(saver.balance + limit),
    ]);
  });

  test("transfer of one pound over the daily limit is rejected with the limit message", { annotation: { type: "xray", description: "JD-141-TC2" } }, async ({ loginPage, accountsPage, transferPage }) => {
    await loginPage.login(users.dailyLimit.username, users.dailyLimit.password);
    await accountsPage.transferTab.click();
    await transferPage.transfer({ fromIndex: 0, toIndex: 1, amount: String(limit + 1) });

    await expect(transferPage.error).toHaveText(`Daily limit is ${limit}`);
    await expect(transferPage.success).toHaveCount(0);

    await accountsPage.accountsTab.click();
    await expect(accountsPage.balances).toHaveText([gbp.format(current.balance), gbp.format(saver.balance)]);
  });
});
