import { test, expect, users } from "../fixtures";

// Xray keys in the annotations map each test to a manual test case. The
// export script reads them to post results back.
test.describe("Log on", () => {
  test("valid credentials reach the accounts overview @smoke", { annotation: { type: "xray", description: "BANK-101" } }, async ({ loginPage, accountsPage }) => {
    await loginPage.login(users.happyPath.username, users.happyPath.password);
    await expect(accountsPage.list).toBeVisible();
    await expect(accountsPage.cards).toHaveCount(users.happyPath.accounts.length);
  });

  test("wrong password shows an error and stays on the log on page", { annotation: { type: "xray", description: "BANK-102" } }, async ({ loginPage }) => {
    await loginPage.login(users.happyPath.username, "wrong-password");
    await expect(loginPage.error).toHaveText("Invalid username or password");
    await expect(loginPage.submit).toBeVisible();
  });

  test("locked account shows the locked message", { annotation: { type: "xray", description: "BANK-103" } }, async ({ loginPage }) => {
    await loginPage.login(users.locked.username, users.locked.password);
    await expect(loginPage.error).toContainText("locked");
  });

  test("log out returns to the log on page", { annotation: { type: "xray", description: "BANK-104" } }, async ({ loginPage, accountsPage }) => {
    await loginPage.login(users.happyPath.username, users.happyPath.password);
    await accountsPage.logout.click();
    await expect(loginPage.submit).toBeVisible();
  });
});
