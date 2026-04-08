Feature: Login
  Validate the login form

  Scenario: Successful login with valid credentials
    Given the login page is open
    When I enter "Alice" as the username and "12345" as the password and submit
    Then I should be redirected to "/dashboard"

  Scenario: Failed login with invalid password
    Given the login page is open
    When I enter "Alice" as the username and "wrong_password" as the password and submit
    Then I should see an error message

  Scenario: Failed login with invalid username
    Given the login page is open
    When I enter "Alice_wrong_username" as the username and "12345" as the password and submit
    Then I should see an error message