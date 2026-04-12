import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest'
import { getGlobalRanking } from '../services/rankingService'
import * as httpClientModule from '../utils/httpClient'

describe('rankingService', () => {
  beforeEach(() => {
    vi.spyOn(httpClientModule, 'httpClient')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('debería retornar lista de ranking con múltiples jugadores', async () => {
    const mockRanking = [
      {
        _id: '1',
        username: 'player1',
        totalGames: 50,
        gamesWon: 40,
        gamesLost: 10,
        score: 5000
      },
      {
        _id: '2',
        username: 'player2',
        totalGames: 30,
        gamesWon: 20,
        gamesLost: 10,
        score: 3000
      }
    ]

    vi.mocked(httpClientModule.httpClient).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRanking
    } as Response)

    const result = await getGlobalRanking()

    expect(result).toEqual(mockRanking)
    expect(result.length).toBe(2)
    expect(result[0].username).toBe('player1')
  })

  test('debería lanzar error en caso de error del servidor', async () => {
    vi.mocked(httpClientModule.httpClient).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    } as Response)

    await expect(getGlobalRanking()).rejects.toThrow('Error 500: Internal Server Error')
  })
})
