Feature: California requirement page
  The page quotes the statute word for word, links the official source, dates the check and ends with the fixed footer (R3).

  Scenario: The page shows its source and the fixed footer
    Given I open "/state-rules/california/"
    Then I see the statute quoted with "A change-order form for changes or extra work shall be incorporated into the contract and shall become part of the contract only if it is in writing and signed by the parties prior to the commencement of any work covered by a change order."
    And every quote cites the official source on leginfo.legislature.ca.gov
    And I see a link to the official source
    And I see the date it was last verified
    And the page ends with the footer "General information, not legal advice. Check with your state licensing board or a lawyer."
