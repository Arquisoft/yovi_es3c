import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest'
import { getUserStats, getUserScore, updateUserStats } from '../services/gameService'
import * as httpClientModule from '../utils/httpClient'

describe('gameService', () => {
  beforeEach(() => {
    vi.spyOn(httpClientModule, 'httpClient')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getUserStats', () => {
    test('debería retornar estadísticas del usuario correctamente', async () => {
      const mockStats = {
        totalGames: 10,
        gamesWon: 7,
        gamesLost: 3,
        winPercentage: 70,
        score: 1500
      }

      vi.mocked(httpClientModule.httpClient).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats
      } as Response)

      const result = await getUserStats('testuser')

      expect(result).toEqual(mockStats)
      expect(httpClientModule.httpClient).toHaveBeenCalledWith('http://localhost:3000/getuserstats/testuser')
    })

    test('debería lanzar error cuando el usuario no existe', async () => {
      vi.mocked(httpClientModule.httpClient).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      } as Response)

      await expect(getUserStats('nonexistent')).rejects.toThrow('Error 404: Not Found')
    })
  })

  describe('getUserScore', () => {
    test('debería retornar la puntuación del usuario', async () => {
      const mockScore = { score: 2500 }

      vi.mocked(httpClientModule.httpClient).mockResolvedValueOnce({
        ok: true,
        json: async () => mockScore
      } as Response)

      const result = await getUserScore('testuser')

      expect(result).toEqual(mockScore)
      expect(httpClientModule.httpClient).toHaveBeenCalledWith('http://localhost:3000/getuserscore/testuser')
    })

    test('debería lanzar error al obtener puntuación con usuario inválido', async () => {
      vi.mocked(httpClientModule.httpClient).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      } as Response)

      await expect(getUserScore('invalid')).rejects.toThrow('Error 400: Bad Request')
    })
  })

  describe('updateUserStats', () => {
    test('debería actualizar estadísticas cuando el usuario gana', async () => {
      const mockUpdated = {
        totalGames: 11,
        gamesWon: 8,
        gamesLost: 3,
        score: 2000
      }

      vi.mocked(httpClientModule.httpClient).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdated
      } as Response)

      const result = await updateUserStats('testuser', true, 500)

      expect(result).toEqual(mockUpdated)
      expect(httpClientModule.httpClient).toHaveBeenCalledWith(
        'http://localhost:3000/updateuserstats',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ username: 'testuser', won: true, score: 500 })
        })
      )
    })

    test('debería actualizar estadísticas cuando el usuario pierde', async () => {
      const mockUpdated = {
        totalGames: 11,
        gamesWon: 7,
        gamesLost: 4,
        score: 1400
      }

      vi.mocked(httpClientModule.httpClient).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdated
      } as Response)

      const result = await updateUserStats('testuser', false, 100)

      expect(result).toEqual(mockUpdated)
      expect(httpClientModule.httpClient).toHaveBeenCalledWith(
        'http://localhost:3000/updateuserstats',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ username: 'testuser', won: false, score: 100 })
        })
      )
    })

    test('debería lanzar error al actualizar estadísticas con datos inválidos', async () => {
      vi.mocked(httpClientModule.httpClient).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      } as Response)

      await expect(updateUserStats('testuser', true, -100)).rejects.toThrow('Error 500: Internal Server Error')
    })
  })
})
