@disputes @web
Feature: Debit card disputes
  As a customer I can raise a dispute on a debit card transaction

  Background:
    Given I log on as "demo.user" with password from profile

  @TC-DISP-001 @smoke
  Scenario: Raise a dispute on a card transaction
    When I open the "Everyday Current Account" statement
    And I select the transaction with description "Amazon"
    And I choose "Dispute this transaction"
    And I pick the reason "I did not make this purchase"
    And I confirm the dispute
    Then I see the message "Your dispute has been raised"
    And the transaction shows the label "Disputed"

  @TC-DISP-002
  Scenario: Cannot dispute a credit
    When I open the "Everyday Current Account" statement
    And I select the transaction with description "Salary"
    Then the option "Dispute this transaction" is not available

  @TC-DISP-003
  Scenario Outline: Reason is mandatory
    When I open the "Everyday Current Account" statement
    And I select the transaction with description "<merchant>"
    And I choose "Dispute this transaction"
    And I confirm the dispute
    Then I see the validation "Choose a reason"

    Examples:
      | merchant |
      | Amazon   |
      | Tesco    |
