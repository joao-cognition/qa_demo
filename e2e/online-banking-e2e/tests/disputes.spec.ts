import { test, expect, users } from "../fixtures";
import { disputeTransactions as tx } from "../fixtures/test-data";

// Migrated from legacy/pytalos-disputes/features/disputes.feature (JD-148).
// One Gherkin scenario = one test; the outline is a loop over its examples.
// The sample app has no dispute screens or API yet, so every test is declared
// with test.fixme: it is skipped, stays visible to the Xray export through its
// annotation, and starts running once the locator contract in
// pages/DisputesPage.ts is delivered by the app team.
const BLOCKED =
  "apps/online-banking-web has no dispute screens or API; waiting on the data-testid contract in pages/DisputesPage.ts";

const account = users.happyPath.accounts[0].name; // "Everyday Current Account"

test.describe("Debit card disputes", () => {
  // Background: Given I log on as "demo.user" with password from profile
  test.beforeEach(async ({ loginPage, accountsPage }) => {
    await loginPage.login(users.happyPath.username, users.happyPath.password);
    await expect(accountsPage.list).toBeVisible();
  });

  test.fixme(
    "Raise a dispute on a card transaction @smoke",
    {
      annotation: [
        { type: "xray", description: "JD-148-TC1" },
        { type: "talos", description: "@TC-DISP-001" },
        { type: "blocked", description: BLOCKED },
      ],
    },
    async ({ disputesPage }) => {
      await disputesPage.openStatement(account);
      await disputesPage.selectTransaction(tx.debit);
      await disputesPage.chooseDispute();
      await disputesPage.pickReason(tx.reason);
      await disputesPage.confirm();
      await expect(disputesPage.success).toContainText("Your dispute has been raised");
      await expect(disputesPage.transactionStatus(tx.debit)).toHaveText("Disputed");
    },
  );

  test.fixme(
    "Cannot dispute a credit",
    {
      annotation: [
        { type: "xray", description: "JD-148-TC2" },
        { type: "talos", description: "@TC-DISP-002" },
        { type: "blocked", description: BLOCKED },
      ],
    },
    async ({ disputesPage }) => {
      await disputesPage.openStatement(account);
      await disputesPage.selectTransaction(tx.credit);
      await expect(disputesPage.disputeButton).toHaveCount(0);
    },
  );

  // Scenario Outline: Reason is mandatory
  for (const merchant of [tx.debit, tx.secondDebit]) {
    test.fixme(
      `Reason is mandatory (${merchant})`,
      {
        annotation: [
          { type: "xray", description: "JD-148-TC3" },
          { type: "talos", description: "@TC-DISP-003" },
          { type: "blocked", description: BLOCKED },
        ],
      },
      async ({ disputesPage }) => {
        await disputesPage.openStatement(account);
        await disputesPage.selectTransaction(merchant);
        await disputesPage.chooseDispute();
        await disputesPage.confirm();
        await expect(disputesPage.error).toContainText("Choose a reason");
      },
    );
  }
});
