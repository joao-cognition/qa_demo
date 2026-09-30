import { test as base, expect, type APIRequestContext } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { AccountsPage } from "../pages/AccountsPage";
import { TransferPage } from "../pages/TransferPage";
import { DisputesPage } from "../pages/DisputesPage";
import { users } from "./test-data";

type Fixtures = {
  loginPage: LoginPage;
  accountsPage: AccountsPage;
  transferPage: TransferPage;
  disputesPage: DisputesPage;
  resetData: void;
};

async function resetServerData(request: APIRequestContext, baseURL: string) {
  const login = await request.post(`${baseURL}/api/login`, {
    data: { username: users.happyPath.username, password: users.happyPath.password },
  });
  const { token } = await login.json();
  await request.post(`${baseURL}/api/reset`, { headers: { Authorization: `Bearer ${token}` } });
}

export const test = base.extend<Fixtures>({
  // Every test starts from the seed so results do not depend on ordering.
  resetData: [
    async ({ request, baseURL }, use) => {
      await resetServerData(request, baseURL!);
      await use();
    },
    { auto: true },
  ],
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  accountsPage: async ({ page }, use) => use(new AccountsPage(page)),
  transferPage: async ({ page }, use) => use(new TransferPage(page)),
  disputesPage: async ({ page }, use) => use(new DisputesPage(page)),
});

export { expect, users };
