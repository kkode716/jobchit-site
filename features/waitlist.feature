Feature: Join the waitlist
  A contractor who wants Jobchit can reach the waitlist from the hero and from the pricing page.

  Scenario: From the hero on the home page
    Given I open "/"
    When I choose "Join the waitlist" in the hero
    Then I am at the waitlist section

  Scenario: From the plan card on the pricing page
    Given I open "/pricing/"
    When I choose "Join the waitlist" on the plan card
    Then I am at the waitlist section

  Scenario: The form loads in the waitlist section
    Given I open "/"
    When I choose "Join the waitlist" in the hero
    Then the waitlist form loads from Tally

  Scenario: Tally doesn't load
    Given Tally is blocked
    And I open "/"
    When I choose "Join the waitlist" in the hero
    Then I can open the form on Tally

  Scenario: JavaScript is off
    Given JavaScript is off
    And I open "/"
    Then I can open the form on Tally
