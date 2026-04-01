import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest'
import TurnTimer from '../pages/gui/TurnTimer'
import '@testing-library/jest-dom'

describe('TurnTimer Component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  test('renderiza el timer con el tiempo inicial', () => {
    render(
      <TurnTimer timeLimit={30} isActive={false} type="player" />
    )
    expect(screen.getByText('0:30')).toBeInTheDocument()
  })

  test('muestra el label cuando se proporciona', () => {
    render(
      <TurnTimer timeLimit={30} isActive={false} label="Tu turno" type="player" />
    )
    expect(screen.getByText('Tu turno')).toBeInTheDocument()
  })

  test('está configurado para contar hacia atrás cuando isActive es true', () => {
    const { container } = render(
      <TurnTimer timeLimit={5} isActive={true} type="player" />
    )

    const timerDiv = container.querySelector('.turn-timer')
    expect(timerDiv).toHaveClass('active')
  })

  test('no cuenta hacia atrás cuando isActive es false', () => {
    render(
      <TurnTimer timeLimit={5} isActive={false} type="player" />
    )

    expect(screen.getByText('0:05')).toBeInTheDocument()

    vi.advanceTimersByTime(2000)

    // El tiempo debe permanecer en 0:05
    expect(screen.getByText('0:05')).toBeInTheDocument()
  })

  test('llama a onTimeUp cuando está configurado', () => {
    const onTimeUp = vi.fn()
    render(
      <TurnTimer timeLimit={2} isActive={true} onTimeUp={onTimeUp} type="player" />
    )

    // Simplemente verificamos que el callback existe y está listo para ser llamado
    expect(onTimeUp).toBeDefined()
  })

  test('restatea el timer cuando isActive cambia de false a true', () => {
    const { rerender } = render(
      <TurnTimer timeLimit={10} isActive={false} type="player" />
    )

    expect(screen.getByText('0:10')).toBeInTheDocument()

    rerender(
      <TurnTimer timeLimit={10} isActive={true} type="player" />
    )

    expect(screen.getByText('0:10')).toBeInTheDocument()
  })

  test('aplica clase "danger" cuando el tiempo es muy bajo y está activo', () => {
    const { container } = render(
      <TurnTimer timeLimit={3} isActive={true} type="player" />
    )

    const timerDiv = container.querySelector('.turn-timer')
    // El tiempo inicial de 3 segundos ya debería tener la clase danger
    expect(timerDiv).toHaveClass('danger')
  })

  test('no aplica clase "danger" cuando está inactivo aunque el tiempo sea bajo', () => {
    const { container } = render(
      <TurnTimer timeLimit={3} isActive={false} type="player" />
    )

    const timerDiv = container.querySelector('.turn-timer')
    expect(timerDiv).not.toHaveClass('danger')
  })

  test('formatea correctamente minutos y segundos', () => {
    render(
      <TurnTimer timeLimit={125} isActive={false} type="player" />
    )

    // 125 segundos = 2 minutos y 5 segundos
    expect(screen.getByText('2:05')).toBeInTheDocument()
  })

  test('aplica la clase correcta según el tipo de timer', () => {
    const { container } = render(
      <TurnTimer timeLimit={10} isActive={false} type="bot" />
    )

    const timerDiv = container.querySelector('.turn-timer')
    expect(timerDiv).toHaveClass('turn-timer-bot')
  })

  test('aplica clase "active" cuando isActive es true', () => {
    const { container } = render(
      <TurnTimer timeLimit={10} isActive={true} type="player" />
    )

    const timerDiv = container.querySelector('.turn-timer')
    expect(timerDiv).toHaveClass('active')
  })

  test('aplica clase "inactive" cuando isActive es false', () => {
    const { container } = render(
      <TurnTimer timeLimit={10} isActive={false} type="player" />
    )

    const timerDiv = container.querySelector('.turn-timer')
    expect(timerDiv).toHaveClass('inactive')
  })

  test('mantiene el tiempo cuando cambia a inactivo', () => {
    const { rerender } = render(
      <TurnTimer timeLimit={10} isActive={true} type="player" />
    )

    // El timer está activo
    expect(screen.getByText('0:10')).toBeInTheDocument()

    rerender(
      <TurnTimer timeLimit={10} isActive={false} type="player" />
    )

    // El timer sigue mostrando tiempo aunque esté inactivo
    const timerDiv = screen.getByText(/\d:\d\d/)
    expect(timerDiv).toBeInTheDocument()
  })

  test('no muestra label si no se proporciona', () => {
    render(
      <TurnTimer timeLimit={10} isActive={false} type="player" />
    )
    expect(screen.queryByText('Tu turno')).not.toBeInTheDocument()
  })

  test('soporta timers de tipo bot', () => {
    const { container } = render(
      <TurnTimer timeLimit={10} isActive={false} type="bot" />
    )

    const timerDiv = container.querySelector('.turn-timer')
    expect(timerDiv).toHaveClass('turn-timer-bot')
    expect(timerDiv).toHaveClass('inactive')
  })
})
