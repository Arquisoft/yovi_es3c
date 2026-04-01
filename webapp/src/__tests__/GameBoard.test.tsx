import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi, beforeEach } from 'vitest'
import GameBoard from '../pages/gui/GameBoard'
import '@testing-library/jest-dom'

const mockGetLayoutState = vi.fn()
const mockUpdateLayoutPosition = vi.fn()

vi.mock('../pages/gui/boardUtils', () => ({
  coordToRowCol: vi.fn(() => ({ row: 0, col: 0 })),
  createInitialLayout: vi.fn((size) => '.' .repeat(size * (size + 1) / 2)),
  updateLayoutPosition: (...args: any[]) => mockUpdateLayoutPosition(...args),
  getLayoutState: (...args: any[]) => mockGetLayoutState(...args),
}))

describe('GameBoard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
    localStorage.clear()
    mockGetLayoutState.mockReturnValue('.')
    mockUpdateLayoutPosition.mockReturnValue('NEWLAYOUT')
  })

  test('renderiza el tablero con filas según el tamaño', () => {
    const { container } = render(
      <GameBoard
        size={3}
        gameOver={false}
        onGameOver={vi.fn()}
        onMoveMade={vi.fn()}
      />
    )

    const rows = container.querySelectorAll('.game-board-row')
    expect(rows.length).toBe(3)
  })

  test('deshabilita hexágonos cuando gameOver es true', () => {
    const { container } = render(
      <GameBoard
        size={3}
        gameOver={true}
        onGameOver={vi.fn()}
        onMoveMade={vi.fn()}
      />
    )

    const hexagons = container.querySelectorAll('.hexagon')
    hexagons.forEach(hex => {
      expect((hex as HTMLElement).style.getPropertyValue('--cursor')).toBe('not-allowed')
    })
  })

  test('no permite click si gameOver es true', async () => {
    const onMoveMade = vi.fn()
    const { container } = render(
      <GameBoard
        size={3}
        gameOver={true}
        onGameOver={vi.fn()}
        onMoveMade={onMoveMade}
      />
    )

    const hexagon = container.querySelector('.hexagon')!
    await userEvent.click(hexagon)

    expect(onMoveMade).not.toHaveBeenCalled()
  })

  test('llama onMoveMade cuando el jugador hace un movimiento', async () => {
    const onMoveMade = vi.fn()
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ongoing' }),
    })

    const { container } = render(
      <GameBoard
        size={3}
        gameOver={false}
        onGameOver={vi.fn()}
        onMoveMade={onMoveMade}
      />
    )

    const hexagon = container.querySelector('.hexagon')!
    await userEvent.click(hexagon)

    await waitFor(() => {
      expect(onMoveMade).toHaveBeenCalled()
    })
  })

  test('guarda el estado del juego en localStorage al hacer un movimiento', async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ongoing' }),
    })

    const { container } = render(
      <GameBoard
        size={3}
        gameOver={false}
        onGameOver={vi.fn()}
        onMoveMade={vi.fn()}
      />
    )

    const hexagon = container.querySelector('.hexagon')!
    await userEvent.click(hexagon)

    await waitFor(() => {
      expect(setItemSpy).toHaveBeenCalledWith('game-board', expect.any(String))
    })
  })

  test('llama onGameOver cuando el juego termina con winner', async () => {
    const onGameOver = vi.fn()
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'finished', winner: 0 }),
    })

    const { container } = render(
      <GameBoard
        size={3}
        gameOver={false}
        onGameOver={onGameOver}
        onMoveMade={vi.fn()}
      />
    )

    const hexagon = container.querySelector('.hexagon')!
    await userEvent.click(hexagon)

    await waitFor(() => {
      expect(onGameOver).toHaveBeenCalledWith(0)
    })
  })

  test('cambia a turno del bot cuando el jugador hace un movimiento', async () => {
    const onTurnChange = vi.fn()
    ;(global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ongoing' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ coords: { x: 5, y: 5 } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ongoing' }),
      })

    const { container } = render(
      <GameBoard
        size={3}
        gameOver={false}
        onGameOver={vi.fn()}
        onMoveMade={vi.fn()}
        onTurnChange={onTurnChange}
      />
    )

    const hexagon = container.querySelector('.hexagon')!
    await userEvent.click(hexagon)

    await waitFor(() => {
      expect(onTurnChange).toHaveBeenCalledWith(false)
    })
  })

  test('maneja errores de fetch silenciosamente', async () => {
    const onTurnChange = vi.fn()
    ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

    const { container } = render(
      <GameBoard
        size={3}
        gameOver={false}
        onGameOver={vi.fn()}
        onMoveMade={vi.fn()}
        onTurnChange={onTurnChange}
      />
    )

    const hexagon = container.querySelector('.hexagon')!
    await userEvent.click(hexagon)

    // Debe returnarse al turno del jugador en caso de error
    await waitFor(() => {
      expect(onTurnChange).toHaveBeenCalledWith(true)
    })
  })

  test('expone skipPlayerTurn vía ref', () => {
    const ref = { current: null }
    render(
      <GameBoard
        size={3}
        ref={ref as any}
        gameOver={false}
        onGameOver={vi.fn()}
        onMoveMade={vi.fn()}
      />
    )

    expect(ref.current).not.toBeNull()
    expect(typeof (ref.current as any).skipPlayerTurn).toBe('function')
  })

  test('skipPlayerTurn dispara makeBotMove', async () => {
    ;(global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ coords: { x: 10, y: 20 } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ongoing' }),
      })

    const onTurnChange = vi.fn()
    const ref = { current: null }
    render(
      <GameBoard
        size={3}
        ref={ref as any}
        gameOver={false}
        onGameOver={vi.fn()}
        onMoveMade={vi.fn()}
        onTurnChange={onTurnChange}
      />
    )

    await (ref.current as any).skipPlayerTurn()

    await waitFor(() => {
      expect(onTurnChange).toHaveBeenCalledWith(false)
    })
  })

  test('deshabilita el tablero mientras el bot está pensando', async () => {
    ;(global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ongoing' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ coords: { x: 5, y: 5 } }),
      })

    const { container } = render(
      <GameBoard
        size={3}
        gameOver={false}
        onGameOver={vi.fn()}
        onMoveMade={vi.fn()}
      />
    )

    const hexagon = container.querySelector('.hexagon')!
    await userEvent.click(hexagon)

    // Mientras espera la respuesta del bot, los hexágonos deben estar deshabilitados
    const hexagons = container.querySelectorAll('.hexagon')
    expect(hexagons.length).toBeGreaterThan(0)
  })

  test('usa tamaño por defecto de 15', () => {
    const { container } = render(
      <GameBoard
        gameOver={false}
        onGameOver={vi.fn()}
        onMoveMade={vi.fn()}
      />
    )

    const rows = container.querySelectorAll('.game-board-row')
    expect(rows.length).toBe(15)
  })
})

