Feature: Free templates
  A contractor can print a change-order or estimate template without an account or an email.

  Scenario: The templates page lists all three
    Given I open "/templates/"
    Then I see links to "Change order for remodelers", "Change order for handymen" and "Estimate"

  Scenario Outline: Open and print <name> without signing in
    Given I open "<path>"
    Then I see the heading "<heading>"
    And the page asks for no sign-in or email
    And I see a "Print" button
    And I see a "Download PDF" link
    And the "Download PDF" link returns a PDF
    When I press "Print"
    Then the print dialog opens

    Examples:
      | name                    | path                                 | heading                      |
      | the remodeler template  | /templates/change-order-remodelers/  | Change order for remodelers  |
      | the handyman template   | /templates/change-order-handymen/    | Change order for handymen    |
      | the estimate template   | /templates/estimate/                 | Estimate                     |
