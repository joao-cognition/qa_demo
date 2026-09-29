// WebdriverIO + Appium configuration for a device cloud. Copy to wdio.conf.js and
// fill the environment variables in CI; nothing sensitive lives in this file.
exports.config = {
  runner: "local",
  specs: ["./test/**/*.e2e.js"],
  user: process.env.DEVICE_CLOUD_USER,
  key: process.env.DEVICE_CLOUD_KEY,
  hostname: process.env.DEVICE_CLOUD_HOST || "ondemand.eu-central-1.saucelabs.com",
  port: 443,
  protocol: "https",
  path: "/wd/hub",
  capabilities: [
    {
      platformName: process.env.PLATFORM || "Android",
      "appium:deviceName": process.env.DEVICE_NAME || "Google Pixel 8",
      "appium:platformVersion": process.env.PLATFORM_VERSION || "14",
      "appium:automationName": process.env.PLATFORM === "iOS" ? "XCUITest" : "UiAutomator2",
      "appium:app": process.env.APP_ID, // e.g. storage:filename=app-sit.apk
      "sauce:options": { name: "online banking smoke", build: process.env.BUILD_ID },
    },
  ],
  framework: "mocha",
  reporters: ["spec", ["junit", { outputDir: "./results" }]],
  mochaOpts: { timeout: 120000 },
};
