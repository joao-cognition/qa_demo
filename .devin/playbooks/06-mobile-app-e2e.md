# Set up and run end-to-end tests for a native mobile app

Trigger: `!QA_mobile_app_e2e`

## Overview

Bring a native iOS or Android application into the same flow as the web suites: test cases in Xray, automated tests in the end-to-end repository, results back to Jira, with execution on a device cloud. The playbook covers the setup that is specific to mobile (app builds, device capabilities, accessibility identifiers as locators, platform runners) and then reuses the generation, data and repair playbooks for everything else.

## What's Needed From User

- The app build for the test environment (`.apk` and `.ipa`), or the pipeline that produces it, and where builds are stored.
- Device cloud account and credentials in the secret store, and the devices or OS versions in scope.
- The mobile automation framework the team uses today (WebdriverIO or Java with Appium, Espresso or XCUITest) so the suite follows it.
- Whether iOS is in scope for the pilot. iOS builds and simulators need macOS, so the runner (device cloud, a macOS agent, or Devin Cloud with iOS support) has to be agreed before iOS tests are written.
- The app team's contact for accessibility identifiers, since these are the locator contract on mobile.

## Procedure

1. Confirm the runner path for each platform: Android on Linux with the device cloud, iOS through the device cloud or a macOS runner. Record what is available now and what is blocked.
2. Install the app build on a cloud device and walk the screens in scope, recording the accessibility identifiers present. Screens without identifiers are listed for the app team before tests are written for them.
3. Read the existing mobile automation repository (or create the skeleton from `e2e/mobile-app-e2e` in the reference repository): configuration reads platform, device and app id from environment variables; one screen object per screen; personas shared with the web suite.
4. Run the generation playbook for the journeys in scope, with the mobile screen objects as the locator layer and the same Xray project.
5. Run on the device cloud for one Android device first, then widen to the device matrix once green.
6. Wire the CI job: fetch the build id, run the suite, upload the device cloud video and logs as artifacts, publish to Xray.
7. Hand the repair playbook the same trigger as the web suite so failing mobile runs on a pull request start a session.

## Specifications

- Locators are accessibility identifiers; text and coordinates are never used.
- Device capabilities and app ids come from environment variables; nothing device specific is hard coded in a test.
- Each run records the build id it tested.
- Videos from the device cloud are attached as evidence on the pull request for any failure.
- iOS work is not started until the runner is confirmed; the blocker is recorded in the pull request and the pilot plan.
