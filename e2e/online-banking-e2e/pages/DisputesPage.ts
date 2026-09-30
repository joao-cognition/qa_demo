import type { Page } from "@playwright/test";

// Draft page object for the card dispute journey migrated from
// legacy/pytalos-disputes. The sample app has no dispute screens yet, so every
// locator below that is not already rendered by apps/online-banking-web is the
// data-testid contract requested from the app team (see
// migration/talos-disputes-inventory.md). Only the statement locators resolve
// against the live page today.
export class DisputesPage {
  constructor(readonly page: Page) {}

  // Statement (exists today, shared with AccountsPage)
  readonly accountCards = this.page.getByTestId("account-card");
  readonly statement = this.page.getByTestId("statement");
  readonly transactionRows = this.page.getByTestId("transaction-row");

  // Transaction detail (requested)
  readonly transactionDetail = this.page.getByTestId("transaction-detail");
  readonly disputeButton = this.page.getByTestId("dispute-transaction");

  // Dispute form (requested)
  readonly form = this.page.getByTestId("dispute-form");
  readonly reasons = this.form.getByTestId("dispute-reason");
  readonly submit = this.page.getByTestId("dispute-submit");
  readonly success = this.page.getByTestId("dispute-success");
  readonly error = this.page.getByTestId("dispute-error");

  transactionRow(description: string) {
    return this.transactionRows.filter({ hasText: description }).first();
  }

  // Status badge inside a row (requested), e.g. "Disputed"
  transactionStatus(description: string) {
    return this.transactionRow(description).getByTestId("transaction-status");
  }

  reason(label: string) {
    return this.form.getByRole("radio", { name: label });
  }

  async openStatement(accountName: string) {
    await this.accountCards.filter({ hasText: accountName }).click();
    await this.statement.waitFor();
  }

  async selectTransaction(description: string) {
    await this.transactionRow(description).click();
    await this.transactionDetail.waitFor();
  }

  async chooseDispute() {
    await this.disputeButton.click();
    await this.form.waitFor();
  }

  async pickReason(label: string) {
    await this.reason(label).check();
  }

  async confirm() {
    await this.submit.click();
  }
}
