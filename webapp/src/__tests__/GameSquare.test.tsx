import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import GameSquare from '../pages/gui/GameSquare'
import '@testing-library/jest-dom'

describe('GameSquare Component', () => {
  test('renderiza un hexágono con atributos de datos', () => {
    const onClick = vi.fn()
    const { container } = render(
      <GameSquare row={0} col={0} state="B" onClick={onClick} disabled={false} />
    )

    const hexagon = container.querySelector('.hexagon')
    expect(hexagon).toBeInTheDocument()
    expect(hexagon).toHaveAttribute('data-row', '0')
    expect(hexagon).toHaveAttribute('data-col', '0')
  })

  test('aplica color azul cuando state es B', () => {
    const onClick = vi.fn()
    const { container } = render(
      <GameSquare row={0} col={0} state="B" onClick={onClick} disabled={false} />
    )

    const hexagon = container.querySelector('.hexagon') as HTMLElement
    // Verificamos que el color se define en CSS variables
    expect(hexagon.style.getPropertyValue('--color')).toBe('blue')
  })

  test('aplica color rojo cuando state es R', () => {
    const onClick = vi.fn()
    const { container } = render(
      <GameSquare row={0} col={0} state="R" onClick={onClick} disabled={false} />
    )

    const hexagon = container.querySelector('.hexagon') as HTMLElement
    expect(hexagon.style.getPropertyValue('--color')).toBe('red')
  })

  test('aplica color gris cuando state es otro', () => {
    const onClick = vi.fn()
    const { container } = render(
      <GameSquare row={0} col={0} state="E" onClick={onClick} disabled={false} />
    )

    const hexagon = container.querySelector('.hexagon') as HTMLElement
    expect(hexagon.style.getPropertyValue('--color')).toBe('grey')
  })

  test('aplica cursor pointer cuando no está disabled', () => {
    const onClick = vi.fn()
    const { container } = render(
      <GameSquare row={0} col={0} state="B" onClick={onClick} disabled={false} />
    )

    const hexagon = container.querySelector('.hexagon') as HTMLElement
    expect(hexagon.style.getPropertyValue('--cursor')).toBe('pointer')
  })

  test('aplica cursor not-allowed cuando está disabled', () => {
    const onClick = vi.fn()
    const { container } = render(
      <GameSquare row={0} col={0} state="B" onClick={onClick} disabled={true} />
    )

    const hexagon = container.querySelector('.hexagon') as HTMLElement
    expect(hexagon.style.getPropertyValue('--cursor')).toBe('not-allowed')
  })

  test('llama onClick con row y col cuando se hace click y no está disabled', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    const { container } = render(
      <GameSquare row={5} col={10} state="B" onClick={onClick} disabled={false} />
    )

    const hexagon = container.querySelector('.hexagon')!
    await user.click(hexagon)

    expect(onClick).toHaveBeenCalledWith(5, 10)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  test('no llama onClick cuando está disabled', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    const { container } = render(
      <GameSquare row={5} col={10} state="B" onClick={onClick} disabled={true} />
    )

    const hexagon = container.querySelector('.hexagon')!
    await user.click(hexagon)

    expect(onClick).not.toHaveBeenCalled()
  })

  test('maneja diferentes posiciones de row y col', () => {
    const onClick = vi.fn()
    const { container } = render(
      <GameSquare row={15} col={20} state="R" onClick={onClick} disabled={false} />
    )

    const hexagon = container.querySelector('.hexagon')
    expect(hexagon).toHaveAttribute('data-row', '15')
    expect(hexagon).toHaveAttribute('data-col', '20')
  })

  test('responde a cambios en state', () => {
    const onClick = vi.fn()
    const { container, rerender } = render(
      <GameSquare row={0} col={0} state="B" onClick={onClick} disabled={false} />
    )

    let hexagon = container.querySelector('.hexagon') as HTMLElement
    expect(hexagon.style.getPropertyValue('--color')).toBe('blue')

    rerender(
      <GameSquare row={0} col={0} state="R" onClick={onClick} disabled={false} />
    )

    hexagon = container.querySelector('.hexagon') as HTMLElement
    expect(hexagon.style.getPropertyValue('--color')).toBe('red')
  })
})
