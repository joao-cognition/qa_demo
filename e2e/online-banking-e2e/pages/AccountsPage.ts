import type { Locator, Page } from "@playwright/test";

export class AccountsPage {
  constructor(readonly page: Page) {}

  readonly list = this.page.getByTestId("accounts-list");
  readonly cards = this.page.getByTestId("account-card");
  readonly balances = this.page.getByTestId("account-balance");
  readonly transferTab = this.page.getByTestId("tab-transfer");
  readonly statement = this.page.getByTestId("statement");
  readonly statementBalance = this.page.getByTestId("statement-balance");
  readonly transactionRows = this.page.getByTestId("transaction-row");
  readonly backToAccounts = this.page.getByTestId("back-to-accounts");
  readonly logout = this.page.getByTestId("logout");

  async openAccount(index: number) {
    await this.cards.nth(index).click();
  }

  // The amount is the last column of a statement row. No test id exists on
  // the cell yet (locator contract request: data-testid="transaction-amount").
  amountOf(row: Locator) {
    return row.getByRole("cell").last();
  }
}
