# pytalos-disputes (legacy suite, migration source)

A small suite in the shape of a PyTalos project: Gherkin features, Python step definitions built on Behave and Selenium, and per-environment profile files. It covers the debit card dispute flow of the sample app and exists so the Talos to Playwright migration playbook has something realistic to convert.

It is a migration source and is not run here. The migration writes the Playwright equivalent into `e2e/online-banking-e2e/tests/`.

```
features/disputes.feature      scenarios, one per manual test case
steps/disputes_steps.py        step definitions, Selenium locators inline
profiles/sit.cfg               environment URL and user for the SIT profile
```
