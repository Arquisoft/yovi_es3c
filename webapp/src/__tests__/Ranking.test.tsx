import { describe, expect, test, vi, afterEach} from 'vitest'
import { AuthProvider } from '../context/AuthContext'
import { MemoryRouter } from 'react-router-dom'
import Ranking from '../pages/Ranking'
import {render, screen, waitFor} from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import * as rankingService from '../services/rankingService'

// Mock de getGlobalRanking.
vi.mock('../services/rankingService', () => ({
    getGlobalRanking: vi.fn(),
}))

const mockPlayers = [
    { _id: '1', username: 'test1', totalGames: 10, gamesWon: 8, gamesLost: 2},
    { _id: '2', username: 'test2', totalGames: 6, gamesWon: 3, gamesLost: 3},
    { _id: '3', username: 'test3', totalGames: 0, gamesWon: 0, gamesLost: 0},
]

const renderComponent = () =>
    render(
        <AuthProvider>
            <MemoryRouter>
                <Ranking />
            </MemoryRouter>
        </AuthProvider>
    )

describe('Ranking Compontent', () => {
    afterEach(() => {
        vi.clearAllMocks()
        localStorage.clear()
    })

    // Carga y render.

    test('muestra el mensaje de carga inicial', async() => {
        vi.spyOn(rankingService, 'getGlobalRanking').mockReturnValue(new Promise(() => {}))

        renderComponent()
        expect(screen.getByText(/cargando ranking/i)).toBeInTheDocument()
    })

    test('muestra el título Ranking global', async () => {
        vi.spyOn(rankingService, 'getGlobalRanking').mockResolvedValue(mockPlayers)

        renderComponent()

        await waitFor(() => {
            expect(screen.getByText(/ranking global/i)).toBeInTheDocument()
        })
    })

    test('muestra la lista de jugadores tras cargar', async () => {
        vi.spyOn(rankingService, 'getGlobalRanking').mockResolvedValue(mockPlayers)

        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('test1')).toBeInTheDocument()
            expect(screen.getByText('test2')).toBeInTheDocument()
            expect(screen.getByText('test3')).toBeInTheDocument()
        })
    })

    test('muestra los índices de columna correctamente', async () => {
        vi.spyOn(rankingService, 'getGlobalRanking').mockResolvedValue(mockPlayers)

        renderComponent()

        await waitFor(() => {
          expect(screen.getByText('Jugador')).toBeInTheDocument()
          expect(screen.getByText('Partidas')).toBeInTheDocument()
          expect(screen.getByText('Victorias')).toBeInTheDocument()
          expect(screen.getByText('Derrotas')).toBeInTheDocument()
          expect(screen.getByText('% Victoria')).toBeInTheDocument()
        })
    })

    test('muestra el porcentaje de victoria correctamente', async () => {
        vi.spyOn(rankingService, 'getGlobalRanking').mockResolvedValue(mockPlayers)

        renderComponent()

        await waitFor(() => {
          expect(screen.getByText('80.0%')).toBeInTheDocument() // test1: 8/10
          expect(screen.getByText('50.0%')).toBeInTheDocument() // test2: 3/6
        })
    })

    test('muestra "-" en % victoria para jugadores sin partidas', async () => {
        const { getGlobalRanking } = vi.mocked(
          await import('../services/rankingService')
        )
        getGlobalRanking.mockResolvedValue(mockPlayers)

        renderComponent()

        await waitFor(() => {
          // test3 tiene 0 partidas
          const celdas = screen.getAllByText('-')
          expect(celdas.length).toBeGreaterThan(0)
        })
    })

    // Test de error.

    test('muestra mensaje de error si falla la carga', async () => {
        vi.spyOn(rankingService, 'getGlobalRanking').mockRejectedValue(new Error('Error de red'))

        renderComponent()

        await waitFor(() => {
            expect(screen.getByText(/error al cargar el ranking/i)).toBeInTheDocument()
        })
    })

    // Tests del filtro de ordenar.

    test('al hacer click en la columna Jugador ordena por nombre', async () => {
        vi.spyOn(rankingService, 'getGlobalRanking').mockResolvedValue(mockPlayers)
        const user = userEvent.setup()

        renderComponent()

        await waitFor(() => screen.getByText('Jugador'))

        await user.click(screen.getByText('Jugador'))

        const filas = screen.getAllByRole('row')
        // Primera fila de datos (índice 1, la 0 es el thead)
        expect(filas[1]).toHaveTextContent('test1')
    })

    test('al hacer click dos veces en la columna Victorias invierte el orden', async () => {
        vi.spyOn(rankingService, 'getGlobalRanking').mockResolvedValue(mockPlayers)
        const user = userEvent.setup()

        renderComponent()

        await waitFor(() => screen.getByText('Victorias'))

        // Primer click.
        await user.click(screen.getByText('Victorias'))
        
        // Segundo click
        await user.click(screen.getByText('Victorias'))

        const filas = screen.getAllByRole('row')
        expect(filas[1]).toHaveTextContent('test1') // 8 victorias, el mayor
    })

    // Usuario logueado.

    test('muestra el indicador en la fila del usuario logueado', async () => {
        localStorage.setItem('user', JSON.stringify({ id: '1', username: 'test1' }))
        vi.spyOn(rankingService, 'getGlobalRanking').mockResolvedValue(mockPlayers)

        renderComponent()

        await waitFor(() => {
          expect(screen.getByText(/✪/)).toBeInTheDocument()
        })
    })

    test('no muestra indicador si no hay sesión iniciada', async () => {
        vi.spyOn(rankingService, 'getGlobalRanking').mockResolvedValue(mockPlayers)

        renderComponent()

        await waitFor(() => {
          expect(screen.queryByText(/✪/)).not.toBeInTheDocument()
        })
    })
})