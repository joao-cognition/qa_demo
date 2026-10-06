import type { Page } from "@playwright/test";

export class AccountsPage {
  constructor(readonly page: Page) {}

  readonly list = this.page.getByTestId("accounts-list");
  readonly cards = this.page.getByTestId("account-card");
  readonly balances = this.page.getByTestId("account-balance");
  readonly accountsTab = this.page.getByTestId("tab-accounts");
  readonly transferTab = this.page.getByTestId("tab-transfer");
  readonly statement = this.page.getByTestId("statement");
  readonly transactionRows = this.page.getByTestId("transaction-row");
  readonly logout = this.page.getByTestId("logout");

  async openAccount(index: number) {
    await this.cards.nth(index).click();
  }
}
