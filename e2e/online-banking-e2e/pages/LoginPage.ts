import type { Page } from "@playwright/test";

export class LoginPage {
  constructor(readonly page: Page) {}

  readonly username = this.page.getByTestId("username");
  readonly password = this.page.getByTestId("password");
  readonly submit = this.page.getByTestId("login-submit");
  readonly error = this.page.getByTestId("login-error");

  async goto() {
    await this.page.goto("/");
  }

  async login(username: string, password: string) {
    await this.goto();
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submit.click();
  }
}
