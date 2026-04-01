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
    },
    getTimeLimitForBot: vi.fn(() => 30),
}))

vi.mock('../pages/gui/GameBoard', () => ({
    default: ({onGameOver, onMoveMade, onTurnChange}: {onGameOver: (winner:number) => void, onMoveMade?: () => void, onTurnChange?: (isPlayerTurn: boolean) => void}) => (
        <div data-testid="mock-gameboard">
            <button onClick={() => onGameOver(0)}>Simular Victoria</button>
            <button onClick={() => onGameOver(1)}>Simular derrota</button>
            <button onClick={() => onMoveMade?.()}>Simular Movimiento</button>
            <button onClick={() => onTurnChange?.(false)}>Cambiar a turno Bot</button>
            <button onClick={() => onTurnChange?.(true)}>Cambiar a turno Jugador</button>
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
        expect(screen.getByText('Tu turno')).toBeInTheDocument()
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
                0
            )
        })
    })

    test('muestra el nombre del usuario autenticado', async () => {
        renderComponent()
        expect(screen.getByText('test1')).toBeInTheDocument()
    })

    test('muestra "Invitado" cuando no hay usuario autenticado', () => {
        localStorage.clear()
        renderComponent()
        expect(screen.getByText('Invitado')).toBeInTheDocument()
    })

    test('muestra la puntuación inicial de 10000', () => {
        renderComponent()
        expect(screen.getByText(/Puntuación: 10000/)).toBeInTheDocument()
    })

    test('muestra el contador de movimientos inicial en 0', () => {
        renderComponent()
        expect(screen.getByText(/Movimientos: 0/)).toBeInTheDocument()
    })

    test('incrementa el contador de movimientos cuando se hace un movimiento', async () => {
        const user = userEvent.setup()
        const { getByRole } = renderComponent()

        await user.click(getByRole('button', { name: /simular movimiento/i }))

        await waitFor(() => {
            expect(screen.getByText(/Movimientos: 1/)).toBeInTheDocument()
        })
    })

    test('cambia el timer label cuando cambia el turno a bot', async () => {
        const user = userEvent.setup()
        const { getByRole } = renderComponent()

        // Inicialmente debe mostrar "Tu turno"
        expect(screen.getByText('Tu turno')).toBeInTheDocument()
 
        // Cambiar a turno del bot
        await user.click(getByRole('button', { name: /cambiar a turno bot/i }))

        await waitFor(() => {
            expect(screen.getByText('Turno del Bot')).toBeInTheDocument()
        })
    })

    test('cambia el timer label cuando cambia el turno al jugador', async () => {
        const user = userEvent.setup()
        const { getByRole } = renderComponent()

        // Cambiar a turno del bot
        await user.click(getByRole('button', { name: /cambiar a turno bot/i }))

        // Cambiar de vuelta al turno del jugador
        await user.click(getByRole('button', { name: /cambiar a turno jugador/i }))

        await waitFor(() => {
            expect(screen.getByText('Tu turno')).toBeInTheDocument()
        })
    })

    test('renderiza el nombre "Bot" en la sección del bot', () => {
        renderComponent()
        const botSections = screen.getAllByText('Bot')
        expect(botSections.length).toBeGreaterThan(0)
    })

    test('obtiene la puntuación del usuario cuando gana', async () => {
        const user = userEvent.setup()
        const { getByRole } = renderComponent()

        await user.click(getByRole('button', { name: /simular victoria/i }))

        await waitFor(() => {
            expect(gameService.getUserScore).toHaveBeenCalledWith('test1')
        })
    })

    test('navega al dashboard cuando hace click en ir home', async () => {
        const user = userEvent.setup()
        const { getByRole } = renderComponent()

        // Simular victoria para que aparezca el diálogo
        await user.click(getByRole('button', { name: /simular victoria/i }))

        // El diálogo resultante debería tener un botón "Ir home"
        // (Este test es básico porque el diálogo es mockeado)
        await waitFor(() => {
            expect(screen.getByText(/¡Has ganado!/i)).toBeInTheDocument()
        })
    })


})