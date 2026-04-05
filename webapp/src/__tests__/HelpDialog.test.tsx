import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import HelpDialog from '../pages/HelpDialog'
import HelpContent from '../pages/HelpContent'

beforeEach(() => {
    vi.restoreAllMocks()
    HTMLDialogElement.prototype.showModal = vi.fn(function(this: HTMLDialogElement) {
        this.setAttribute('open', '')
    })
    HTMLDialogElement.prototype.close = vi.fn(function(this: HTMLDialogElement) {
        this.removeAttribute('open')
    })
})

// Test de HelpContent.

describe ('HelpContent', () => {
    describe ('Título principal', () => {
        test('muestra el título ¿Cómo jugar?', () => {
            render (<HelpContent />)
            expect(screen.getByText('¿Cómo jugar?')).toBeInTheDocument()
        })
    })

    describe('Apartados de contenido', () => {
        test('muestra el apartado Objetivo', () => {
            render(<HelpContent />)
            expect(screen.getByText('Objetivo')).toBeInTheDocument()
        })

        test('muestra el apartado Reglas.', () => {
            render(<HelpContent />)
            expect(screen.getByText('Reglas')).toBeInTheDocument()
        })
    })

    describe('Reglas del juego', () => {
        test('muestra la regla de los turnos.', () =>{
            render(<HelpContent />)
            expect(screen.getByText('Los jugadores se turnan colocando una ficha por turno.')).toBeInTheDocument()
        })
        test('muestra la regla de casillas vacías.', () =>{
            render(<HelpContent />)
            expect(screen.getByText('Sólo puedes colocar fichas en casillas vacías.')).toBeInTheDocument()
        })
        test('muestra la regla de la victoria', () =>{
            render(<HelpContent />)
            expect(screen.getByText('El primero en conectar sus dos lados gana la partida.')).toBeInTheDocument()
        })
        test('muestra exactamente 3 reglas', () =>{
            render(<HelpContent />)
            expect(screen.getAllByRole('listitem')).toHaveLength(3)
        })
    })
})

// Test de HelpDialog.

describe('HelpDialog', () => {
    describe('Visibilidad según prop open', () => {

        test('llama a showModal cuando open es true.', () => {
            render(<HelpDialog open={true} onClose={vi.fn()} />)
            expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledOnce()
        })

        test('añade la clase closing al pulsar el botón X', async() => {
            render(<HelpDialog open={true} onClose={vi.fn()} />)
            const dialog = document.querySelector('.help-dialog')!
            await userEvent.click(screen.getByText('X'))
            expect(dialog.classList.contains('closing')).toBe(true)
        })
    })

    describe('Contenido Renderizado', () => {
        test('muestra el título ¿Cómo jugar?', () => {
            render(<HelpDialog open={true} onClose={vi.fn()} />)
            expect(screen.getByText('¿Cómo jugar?')).toBeInTheDocument()
        })

        test('muestra el apartado Objetivo', () => {
            render(<HelpDialog open={true} onClose={vi.fn()} />)
            expect(screen.getByText('Objetivo')).toBeInTheDocument()
        })

        test('muestra el apartado Reglas', () => {
            render(<HelpDialog open={true} onClose={vi.fn()} />)
            expect(screen.getByText('Reglas')).toBeInTheDocument()
        })

        test('muestra las tres reglas del juego', () => {
            render(<HelpDialog open={true} onClose={vi.fn()} />)
            expect(screen.getByText('Los jugadores se turnan colocando una ficha por turno.')).toBeInTheDocument()
            expect(screen.getByText('Sólo puedes colocar fichas en casillas vacías.')).toBeInTheDocument()
            expect(screen.getByText('El primero en conectar sus dos lados gana la partida.')).toBeInTheDocument()
        })

        test('muestra el botón de cierre', () => {
            render(<HelpDialog open={true} onClose={vi.fn()} />)
            expect(screen.getByText('X')).toBeInTheDocument()
        })
    })

    describe('Interacción con el botón de cierre', () => {

        test('llama a onClose al pulsar el botón X tras la animación', async () => {
            vi.useFakeTimers()
            const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) })
            const onClose = vi.fn()
            render(<HelpDialog open={true} onClose={onClose} />)
            await user.click(screen.getByText('X'))
            vi.advanceTimersByTime(300)
            expect(onClose).toHaveBeenCalledOnce()
            vi.useRealTimers()
        })

        test('no llama a onClose si no se pulsa el botón', () => {
            const onClose = vi.fn()
            render(<HelpDialog open={true} onClose={onClose} />)
            expect(onClose).not.toHaveBeenCalled()
        })
    })

    describe('Accesibilidad', () => {

        test('el dialog tiene aria-modal="true"', () => {
            render(<HelpDialog open={true} onClose={vi.fn()} />)
            expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
        })

        test('el dialog tiene aria-label descriptivo', () => {
            render(<HelpDialog open={true} onClose={vi.fn()} />)
            expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Ayuda del juego')
        })
    })
})
