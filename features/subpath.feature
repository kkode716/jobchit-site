Feature: The site works at the root and under the GitHub Pages subpath
  The same build serves jobchit.com and <user>.github.io/jobchit-site/.

  Scenario Outline: No broken internal links under "<prefix>"
    Given the site built for "<prefix>" is served
    When I follow every internal link, stylesheet and asset from the home page and the 404 page
    Then every one answers 200 and stays under "<prefix>"
    And every in-page anchor it points to exists

    Examples:
      | prefix         |
      | /              |
      | /jobchit-site/ |
