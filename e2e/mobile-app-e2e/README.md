# mobile-app-e2e (skeleton)

Native mobile is the customer's first priority and cannot be exercised in this sample, which has no native app. This folder holds the shape a Devin-run mobile suite takes so the mobile playbook has a concrete target.

What is here:

- `wdio.conf.example.js`: WebdriverIO plus Appium configuration pointed at a device cloud, with the app build and device coming from environment variables.
- `test/login.e2e.example.js`: one spec in the same page object style as the web suite, using accessibility ids as the locator contract.

What it needs before it runs, and what the pilot has to settle:

- A signed app build (`.apk` or `.ipa`) uploaded to the device cloud, referenced by `APP_ID`.
- Device cloud credentials in the Devin secret store.
- For iOS, a macOS runner or Devin Cloud with iOS support; Android emulators run on Linux.
- Accessibility ids on the screens under test, or agreement on which locator strategy the app team will keep stable.
