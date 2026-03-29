Feature: Register
  Validate the register form

  Scenario: Successful registration
    Given the register page is open
    When I enter "Alice" as the username and submit
    Then I should see a welcome message containing "Hello Alice"

  Scenario: Failed registration, duplicated username
    Given the register page is open
    When I enter "pruebina" as a duplicated username and submit
    Then I should see an error message containing "El nombre de usuario ya está en uso"