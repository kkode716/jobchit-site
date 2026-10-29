Feature: Pricing toggle
  The plan card switches between monthly and yearly billing.

  Scenario: Choose yearly
    Given I open "/pricing/"
    Then the "Monthly" button is pressed
    And the price shows "$24"
    When I press "Yearly"
    Then the price shows "$240"
    And the "Yearly" button is pressed
    And the "Monthly" button is not pressed

  Scenario: Back to monthly
    Given I open "/pricing/"
    When I press "Yearly"
    And I press "Monthly"
    Then the price shows "$24"
    And the "Monthly" button is pressed
