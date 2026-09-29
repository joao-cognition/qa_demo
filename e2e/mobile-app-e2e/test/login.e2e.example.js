// Same shape as the web suite: one page object per screen, accessibility ids as
// the locator contract, personas from test-data/personas.json.
const personas = require("../../../test-data/personas.json");
const user = personas.find((p) => p.username === "demo.user");

class LoginScreen {
  get username() { return $("~login-username"); }
  get password() { return $("~login-password"); }
  get submit() { return $("~login-submit"); }
  get error() { return $("~login-error"); }
}
class AccountsScreen {
  get list() { return $("~accounts-list"); }
  get cards() { return $$("~account-card"); }
}

describe("Log on (native)", () => {
  it("valid credentials reach the accounts overview", async () => {
    const login = new LoginScreen();
    await login.username.setValue(user.username);
    await login.password.setValue(user.password);
    await login.submit.click();
    await expect(new AccountsScreen().list).toBeDisplayed();
    expect((await new AccountsScreen().cards).length).toBe(user.accounts.length);
  });
});
