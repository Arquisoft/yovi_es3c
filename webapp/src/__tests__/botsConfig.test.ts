import { describe, expect, test } from 'vitest'
import {
  BOTS,
  DIFICULTAD_A_BOTS,
  DIFFICULTY_TIME_LIMITS,
  getDifficultyForBot,
  getTimeLimitForBot
} from '../config/botsConfig'

describe('botsConfig', () => {
  describe('BOTS constant', () => {
    test('contiene al menos 1 bot', () => {
      expect(Object.keys(BOTS).length).toBeGreaterThanOrEqual(1)
    })

    test('todos los valores son strings no vacíos', () => {
      Object.values(BOTS).forEach(botName => {
        expect(typeof botName).toBe('string')
        expect(botName.length).toBeGreaterThan(0)
      })
    })

    test('todas las claves son strings no vacíos', () => {
      Object.keys(BOTS).forEach(botId => {
        expect(typeof botId).toBe('string')
        expect(botId.length).toBeGreaterThan(0)
      })
    })
  })

  describe('DIFICULTAD_A_BOTS constant', () => {
    test('contiene al menos 1 nivel de dificultad', () => {
      expect(Object.keys(DIFICULTAD_A_BOTS).length).toBeGreaterThanOrEqual(1)
    })

    test('cada nivel contiene arrays no vacíos', () => {
      Object.values(DIFICULTAD_A_BOTS).forEach(bots => {
        expect(Array.isArray(bots)).toBe(true)
        expect(bots.length).toBeGreaterThan(0)
      })
    })

    test('todos los bots en DIFICULTAD_A_BOTS existen en BOTS', () => {
      Object.values(DIFICULTAD_A_BOTS).forEach(bots => {
        bots.forEach(botId => {
          expect(BOTS).toHaveProperty(botId)
        })
      })
    })

    test('todos los bots de BOTS están asignados a una dificultad', () => {
      const botsInDifficulty = new Set(
        Object.values(DIFICULTAD_A_BOTS).flat()
      )
      Object.keys(BOTS).forEach(botId => {
        expect(botsInDifficulty).toContain(botId)
      })
    })
  })

  describe('DIFFICULTY_TIME_LIMITS constant', () => {
    test('contiene tiempo límite para cada dificultad', () => {
      Object.keys(DIFICULTAD_A_BOTS).forEach(difficulty => {
        expect(DIFFICULTY_TIME_LIMITS).toHaveProperty(difficulty)
      })
    })

    test('todos los tiempos límite son números positivos', () => {
      Object.values(DIFFICULTY_TIME_LIMITS).forEach(timeLimit => {
        expect(typeof timeLimit).toBe('number')
        expect(timeLimit).toBeGreaterThan(0)
      })
    })
  })

  describe('getDifficultyForBot', () => {
    test('retorna una dificultad válida para todos los bots conocidos', () => {
      Object.keys(BOTS).forEach(botId => {
        const difficulty = getDifficultyForBot(botId)
        expect(DIFICULTAD_A_BOTS).toHaveProperty(difficulty)
      })
    })

    test('retorna la dificultad por defecto para bot desconocido', () => {
      const defaultDifficulty = getDifficultyForBot('unknown_bot_xyz')
      expect(defaultDifficulty).toBe('media')
    })

    test('retorna la dificultad por defecto para string vacío', () => {
      const defaultDifficulty = getDifficultyForBot('')
      expect(defaultDifficulty).toBe('media')
    })

    test('retorna la dificultad correcta para cada bot', () => {
      Object.entries(DIFICULTAD_A_BOTS).forEach(([difficulty, bots]) => {
        bots.forEach(botId => {
          expect(getDifficultyForBot(botId)).toBe(difficulty)
        })
      })
    })
  })

  describe('getTimeLimitForBot', () => {
    test('retorna un número positivo para todos los bots conocidos', () => {
      Object.keys(BOTS).forEach(botId => {
        const timeLimit = getTimeLimitForBot(botId)
        expect(typeof timeLimit).toBe('number')
        expect(timeLimit).toBeGreaterThan(0)
      })
    })

    test('retorna el tiempo límite por defecto (20) para bot desconocido', () => {
      expect(getTimeLimitForBot('unknown_bot_xyz')).toBe(20)
    })

    test('retorna el tiempo límite por defecto para string vacío', () => {
      expect(getTimeLimitForBot('')).toBe(20)
    })

    test('retorna el tiempo límite según la dificultad del bot', () => {
      Object.keys(BOTS).forEach(botId => {
        const difficulty = getDifficultyForBot(botId)
        const expectedTimeLimit = DIFFICULTY_TIME_LIMITS[difficulty]
        const actualTimeLimit = getTimeLimitForBot(botId)
        expect(actualTimeLimit).toBe(expectedTimeLimit)
      })
    })

    test('no retorna valores undefined', () => {
      Object.keys(BOTS).forEach(botId => {
        const timeLimit = getTimeLimitForBot(botId)
        expect(timeLimit).not.toBeUndefined()
      })
    })
  })

  describe('Coherencia general', () => {
    test('cada bot tiene nombre, dificultad y tiempo límite', () => {
      Object.keys(BOTS).forEach(botId => {
        // Nombre
        expect(BOTS[botId]).toBeTruthy()
        // Dificultad
        const difficulty = getDifficultyForBot(botId)
        expect(difficulty).toBeTruthy()
        // Tiempo límite
        const timeLimit = getTimeLimitForBot(botId)
        expect(timeLimit).toBeGreaterThan(0)
      })
    })

    test('no hay bots duplicados en diferentes dificultades', () => {
      const allBots = Object.values(DIFICULTAD_A_BOTS).flat()
      const uniqueBots = new Set(allBots)
      expect(allBots.length).toBe(uniqueBots.size)
    })
  })
})
