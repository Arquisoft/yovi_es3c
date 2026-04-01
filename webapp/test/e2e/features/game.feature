Feature: Game
  Validar el flujo de una partida

  Scenario: El usuario gana una partida
    Given el usuario está logueado y en la pantalla de configuración
    When selecciona la dificultad "fácil", el bot "Aleatorio" y el tamaño "8"
    And realiza movimientos hasta ganar la partida
    Then debería ver el mensaje "¡Has ganado!" en el resumen

  Scenario: El usuario pierde una partida
    Given el usuario está logueado y en la pantalla de configuración
    When selecciona la dificultad "difícil", el bot "Montecarlo" y el tamaño "8"
    And realiza movimientos hasta perder la partida
    Then debería ver el mensaje "¡Has perdido!" en el resumen

  Scenario: El usuario juega de nuevo tras una partida
    Given el usuario ha terminado una partida
    When pulsa jugar de nuevo
    Then debería volver a empezar una nueva partida

  Scenario: El usuario vuelve al inicio tras una partida
    Given el usuario ha terminado una partida
    When pulsa volver al inicio
    Then debería volver a la pantalla de configuración