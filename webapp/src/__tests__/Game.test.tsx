import {render, screen, waitFor} from '@testing-library/react'
import {describe, expect, test, vi, afterEach, beforeEach} from 'vitest'
import Game from '../pages/Game'
import {MemoryRouter} from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import * as gameService from '../services/gameService'

// Mock de useNavigate
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async() => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useLocation: () => ({
            state: { size: 11, botId: 'random_bot'},
        }),
        useNavigate: () => mockNavigate,
    }
})

vi.mock('../services/gameService', () => ({
    updateUserStats: vi.fn().mockResolvedValue({}),
    getUserScore: vi.fn().mockResolvedValue({score:0}),
}))

vi.mock('../config/botsConfig', () => ({
    BOTS: {
        random_bot: 'Aleatorio',
        heuristic_bot: 'Heurístico',
        defensive_bot: 'Defensivo',
        montecarlo_bot: 'Montecarlo',
        shortest_path_bot: 'Dijkstra',
    },
}))

vi.mock('../pages/gui/GameBoard', () => ({
    default: ({onGameOver}: {onGameOver: (winner:number) => void}) => (
        <div data-testid="mock-gameboard">
            <button onClick={() => onGameOver(0)}>Simular Victoria</button>
            <button onClick={() => onGameOver(1)}>Simular derrota</button>
        </div>
    )
}))

vi.mock('../pages/DialogResult', () => ({
  default: ({ won }: { won: boolean }) => (
    <div>{won ? '¡Has ganado!' : '¡Has perdido!'}</div>
  )
}))

describe('Game Component', () => {
    beforeEach(() => {
        localStorage.setItem('user', JSON.stringify({username:'test1'}))
        HTMLDialogElement.prototype.showModal = vi.fn()
        HTMLDialogElement.prototype.close = vi.fn()
    })
    afterEach(() => {
        vi.clearAllMocks()
        localStorage.clear()
    })

    const renderComponent = () => 
        render(
            <MemoryRouter>
                <AuthProvider>
                        <Game />
                </AuthProvider>
            </MemoryRouter>
        )

    test('muestra el texto iniical del turno', () => {
        renderComponent()
        expect(screen.getByText('Es tu turno')).toBeInTheDocument()
    })

    test('muestra el nombre del bot', () => {
        renderComponent()
        expect(screen.getByText(/Aleatorio/i)).toBeInTheDocument()
    })

    test('renderiza el tablero mockeado', () => {
        renderComponent()
        expect(screen.getByTestId('mock-gameboard')).toBeInTheDocument()
    })

    test('cuando el jugador gana, cambia el texto a ¡Has ganado!', async () => {
      const user = userEvent.setup()
      const {getByRole} = renderComponent()

      await user.click(getByRole('button', { name: /simular victoria/i }))

      await waitFor(() => {
        expect(screen.getByText(/¡Has ganado!/i)).toBeInTheDocument()
      })
    })

    test('cuando gana el bot, cambia el texto a ¡Has perdido!', async () => {
      const user = userEvent.setup()
      const {getByRole} = renderComponent()

      await user.click(getByRole('button', { name: /simular derrota/i }))

      await waitFor(() => {
        expect(screen.getByText(/¡Has perdido!/i)).toBeInTheDocument()
      })
    })

    test('llama a updateUserStats con won=true cuando el jugador gana', async () => {
        const user = userEvent.setup()
        const { getByRole } = renderComponent()

        await user.click(getByRole('button', { name: /simular victoria/i }))

        await waitFor(() => {
            expect(gameService.updateUserStats).toHaveBeenCalledWith(
                'test1',
                true,
                10000
            )
        })
    })

    test('llama a updateUserStats con won=false cuando el jugador pierde', async () => {
        const user = userEvent.setup()
        const { getByRole } = renderComponent()

        await user.click(getByRole('button', { name: /simular derrota/i }))

        await waitFor(() => {
            expect(gameService.updateUserStats).toHaveBeenCalledWith(
                'test1',
                false,
                10
            )
        })
    })

    
})