Feature: Check an exact uncommitted site change before committing it
  A maintainer can submit one exact source change for CI and retain its identity without creating a source commit.

  Scenario: Retain the identity of an exact uncommitted preview
    Given I have a clean checkout and an exact uncommitted README change
    When I submit that change through the CI preview event interface
    Then the preview stages exactly that change without creating a commit
    When I retain the checked preview identity through the CI preview interface
    Then the proof binds the original commit and exact patch and checked source tree
