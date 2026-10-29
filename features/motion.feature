Feature: Landing page motion never hides content
  Scroll reveals and demos play once, but nothing stays hidden without JavaScript or with reduced motion.

  Scenario: Without JavaScript every section and the final total show
    Given JavaScript is off
    And I open "/"
    When I scroll to the bottom
    Then every section is fully visible
    And the signature is drawn
    And the estimate total reads "$1,551.91"

  Scenario: With reduced motion the demos show finished on load
    Given I prefer reduced motion
    And I open "/"
    When I scroll to the bottom
    Then every section is fully visible
    And the signature is drawn
    And the estimate total reads "$1,551.91"

  Scenario: With motion the demos play when they reach the screen
    Given I open "/"
    Then the signature is not drawn yet
    When I scroll the signature card to the middle of the screen
    Then the signature is drawn
    When I scroll the estimate card to the middle of the screen
    Then the estimate total reads "$1,551.91"
