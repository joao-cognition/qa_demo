# Step definitions in the PyTalos style: Behave steps calling Selenium through the
# framework's page wrapper. Locators are inline strings, which is the main thing the
# migration has to untangle into page objects.
from behave import given, when, then
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


def wait(context, locator, timeout=10):
    return WebDriverWait(context.driver, timeout).until(EC.visibility_of_element_located(locator))


@given('I log on as "{user}" with password from profile')
def step_login(context, user):
    context.driver.get(context.profile["base_url"])
    wait(context, (By.ID, "username")).send_keys(user)
    context.driver.find_element(By.ID, "password").send_keys(context.profile["users"][user])
    context.driver.find_element(By.XPATH, "//button[contains(text(),'Log on')]").click()
    wait(context, (By.CSS_SELECTOR, "[data-testid='accounts-list']"))


@when('I open the "{account}" statement')
def step_open_statement(context, account):
    context.driver.find_element(By.XPATH, f"//article[contains(., '{account}')]").click()
    wait(context, (By.CSS_SELECTOR, "[data-testid='statement']"))


@when('I select the transaction with description "{merchant}"')
def step_select_tx(context, merchant):
    row = context.driver.find_element(By.XPATH, f"//tr[td[text()='{merchant}']]")
    row.click()
    context.selected_row = row


@when('I choose "{option}"')
def step_choose(context, option):
    context.driver.find_element(By.XPATH, f"//button[text()='{option}']").click()


@when('I pick the reason "{reason}"')
def step_reason(context, reason):
    context.driver.find_element(By.XPATH, f"//label[contains(., '{reason}')]/input").click()


@when("I confirm the dispute")
def step_confirm(context):
    context.driver.find_element(By.CSS_SELECTOR, "#dispute-form button[type='submit']").click()


@then('I see the message "{text}"')
def step_message(context, text):
    assert text in wait(context, (By.CSS_SELECTOR, ".success")).text


@then('I see the validation "{text}"')
def step_validation(context, text):
    assert text in wait(context, (By.CSS_SELECTOR, ".error")).text


@then('the transaction shows the label "{label}"')
def step_label(context, label):
    assert label in context.selected_row.text


@then('the option "{option}" is not available')
def step_not_available(context, option):
    assert not context.driver.find_elements(By.XPATH, f"//button[text()='{option}']")
