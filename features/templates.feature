Feature: Free templates
  A contractor can print a change-order or estimate template without an account or an email.

  Scenario: The templates page lists all thirteen
    Given I open "/templates/"
    Then I see a link to each of these templates:
      | Change order for remodelers |
      | Change order for handymen   |
      | Estimate                    |
      | Change order for painters   |
      | Estimate for painters       |
      | Change order for flooring   |
      | Estimate for flooring       |
      | Change order for decks      |
      | Estimate for decks          |
      | Change order for bathrooms  |
      | Estimate for bathrooms      |
      | Change order for kitchens   |
      | Estimate for kitchens       |

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
      | name                              | path                                 | heading                      |
      | the remodeler template            | /templates/change-order-remodelers/  | Change order for remodelers  |
      | the handyman template             | /templates/change-order-handymen/    | Change order for handymen    |
      | the estimate template             | /templates/estimate/                 | Estimate                     |
      | the painter change order          | /templates/change-order-painters/    | Change order for painters    |
      | the painter estimate              | /templates/estimate-painters/        | Estimate for painters        |
      | the flooring change order         | /templates/change-order-flooring/    | Change order for flooring    |
      | the flooring estimate             | /templates/estimate-flooring/        | Estimate for flooring        |
      | the deck change order             | /templates/change-order-decks/       | Change order for decks       |
      | the deck estimate                 | /templates/estimate-decks/           | Estimate for decks           |
      | the bathroom change order         | /templates/change-order-bathrooms/   | Change order for bathrooms   |
      | the bathroom estimate             | /templates/estimate-bathrooms/       | Estimate for bathrooms       |
      | the kitchen change order          | /templates/change-order-kitchens/    | Change order for kitchens    |
      | the kitchen estimate              | /templates/estimate-kitchens/        | Estimate for kitchens        |
