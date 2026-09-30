import type { Page } from "@playwright/test";

export class TransferPage {
  constructor(readonly page: Page) {}

  readonly from = this.page.getByTestId("transfer-from");
  readonly to = this.page.getByTestId("transfer-to");
  readonly amount = this.page.getByTestId("transfer-amount");
  readonly reference = this.page.getByTestId("transfer-reference");
  // Locator contract with the app: the confirm button is `confirm-payment`
  // (JD-147). Builds that predate the rename still ship `transfer-submit`;
  // drop that branch once every environment serves the renamed build.
  readonly submit = this.page.getByTestId("confirm-payment").or(this.page.getByTestId("transfer-submit"));
  readonly success = this.page.getByTestId("transfer-success");
  readonly error = this.page.getByTestId("transfer-error");

  async transfer(opts: { fromIndex: number; toIndex: number; amount: string; reference?: string }) {
    await this.from.selectOption({ index: opts.fromIndex });
    await this.to.selectOption({ index: opts.toIndex });
    await this.amount.fill(opts.amount);
    if (opts.reference) await this.reference.fill(opts.reference);
    await this.submit.click();
  }
}
