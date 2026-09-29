import { defineConfig, devices } from "@playwright/test";

// APP_URL points at the application under test. Locally the config starts the
// sample app itself; in CI or against a shared environment set APP_URL and the
// webServer block is skipped.
const APP_URL = process.env.APP_URL || "http://localhost:3000";
const startLocalApp = !process.env.APP_URL;
// Set PW_EXECUTABLE_PATH to run against a browser that is already on the
// machine (locked-down runners often cannot download browsers).
const launchOptions = process.env.PW_EXECUTABLE_PATH
  ? { executablePath: process.env.PW_EXECUTABLE_PATH }
  : {};

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 30_000,
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ["json", { outputFile: "test-results/results.json" }],
  ],
  use: {
    baseURL: APP_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: process.env.CI ? "retain-on-failure" : "off",
    launchOptions,
  },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-android", use: { ...devices["Pixel 7"] } },
    { name: "mobile-ios", use: { ...devices["iPhone 14"] } },
  ],
  webServer: startLocalApp
    ? {
        command: "node ../../apps/online-banking-web/server.js",
        url: `${APP_URL}/health`,
        reuseExistingServer: true,
        env: { PORT: "3000", LOCATOR_DRIFT: process.env.LOCATOR_DRIFT || "0" },
      }
    : undefined,
});
