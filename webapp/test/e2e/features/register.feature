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

  Scenario: Failed registration, empty username
  Given the register page is open
  When I leave the "username" field empty and submit
  Then I should see an error message containing "Todos los campos son obligatorios"

  Scenario: Failed registration, empty password
  Given the register page is open
  When I leave the "password" field empty and submit
  Then I should see an error message containing "Todos los campos son obligatorios"

  Scenario: Failed registration, empty confirmPassword
  Given the register page is open
  When I leave the "confirmPassword" field empty and submit
  Then I should see an error message containing "Todos los campos son obligatorios"

  Scenario: Failed registration, passwords don't match
  Given the register page is open
  When I fill the form with two different passwords
  Then I should see an error message containing "Las contraseñas no coinciden"