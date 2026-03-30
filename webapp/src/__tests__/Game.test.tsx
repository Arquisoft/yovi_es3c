import {render, screen, waitFor} from '@testing-library/react'
import {describe, expect, test, vi, afterEach} from 'vitest'
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
}))

vi.mock('../config/botsConfig', () => ({
    BOTS: {
        random_bot: 'Aleatorio',
        heuristic_bot: 'Heurístico',
        defensive_bot: 'Defensivo',
        montecarlo_bot: 'Montecarlo',
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

describe('Game Component', () => {
    afterEach(() => {
        vi.clearAllMocks()
        localStorage.clear()
    })

    const renderComponent = () => 
        render(
            <AuthProvider>
                <MemoryRouter initialEntries={[{pathname: '/game', state: { size: 11, botId: 'random_bot'}}]}>
                    <Game />
                </MemoryRouter>
            </AuthProvider>
        )

    test('muestra el texto iniical del turno', () => {
        renderComponent()
        expect(screen.getByText(/es tu turno/i)).toBeInTheDocument()
    })

    test('muestra el nombre del bot', () => {
        renderComponent()
        expect(screen.getByText(/bot: aleatorio/i)).toBeInTheDocument()
    })

    test('renderiza el tablero mockeado', () => {
        renderComponent()
        expect(screen.getByTestId('mock-gameboard')).toBeInTheDocument()
    })

    test('cuando el jugador gana, cambia el texto a ¡Tú ganas!', async () => {
      const user = userEvent.setup()
      const {getByRole} = renderComponent()

      await user.click(getByRole('button', { name: /simular victoria/i }))

      await waitFor(() => {
        expect(screen.getByText(/¡tú ganas!/i)).toBeInTheDocument()
      })
    })

    test('cuando gana el bot, cambia el texto a ¡El bot gana!', async () => {
      const user = userEvent.setup()
      const {getByRole} = renderComponent()

      await user.click(getByRole('button', { name: /simular derrota/i }))

      await waitFor(() => {
        expect(screen.getByText(/¡el bot gana!/i)).toBeInTheDocument()
      })
    })

    test('llama a updateUserStats con won=true cuando el jugador gana', async () => {
        localStorage.setItem('user', JSON.stringify({ id: '1', username: 'test1' }))
        vi.spyOn(gameService, 'updateUserStats').mockResolvedValue({})
        const user = userEvent.setup()
        const { getByRole } = renderComponent()

        await user.click(getByRole('button', { name: /simular victoria/i }))

        await waitFor(() => {
            expect(gameService.updateUserStats).toHaveBeenCalledWith(
                'test1',
                true
            )
        })
    })

    test('llama a updateUserStats con won=false cuando el jugador pierde', async () => {
        localStorage.setItem('user', JSON.stringify({ id: '1', username: 'test1' }))
        vi.spyOn(gameService, 'updateUserStats').mockResolvedValue({})
        const user = userEvent.setup()
        const { getByRole } = renderComponent()

        await user.click(getByRole('button', { name: /simular derrota/i }))

        await waitFor(() => {
            expect(gameService.updateUserStats).toHaveBeenCalledWith(
                'test1',
                false
            )
        })
    })

    
})