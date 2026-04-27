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
        test('muestra el apartado Objetivo del Juego', () => {
            render(<HelpContent />)
            expect(screen.getByText('Objetivo del Juego')).toBeInTheDocument()
        })

        test('muestra el apartado El Tablero', () => {
            render(<HelpContent />)
            expect(screen.getByText('El Tablero')).toBeInTheDocument()
        })

        test('muestra el apartado Reglas del Juego', () => {
            render(<HelpContent />)
            expect(screen.getByText('Reglas del Juego')).toBeInTheDocument()
        })

        test('muestra el apartado Cómo Ganar o Perder', () => {
            render(<HelpContent />)
            expect(screen.getByText('Cómo Ganar o Perder')).toBeInTheDocument()
        })
    })

    describe('Reglas del juego', () => {
        test('muestra exactamente 6 reglas', () =>{
            render(<HelpContent />)
            expect(screen.getAllByRole('listitem')).toHaveLength(6)
        })

        test('muestra la regla de los turnos', () =>{
            render(<HelpContent />)
            expect(screen.getByText(/Los jugadores alternan turnos/)).toBeInTheDocument()
        })

        test('muestra la regla de colocación', () =>{
            render(<HelpContent />)
            expect(screen.getByText(/En tu turno, haz clic en una casilla vacía/)).toBeInTheDocument()
        })

        test('muestra la regla de una ficha por turno', () =>{
            render(<HelpContent />)
            expect(screen.getByText(/Solo puedes colocar una ficha por turno/)).toBeInTheDocument()
        })

        test('muestra la regla de casillas ocupadas', () =>{
            render(<HelpContent />)
            expect(screen.getByText(/No puedes colocar fichas donde ya hay fichas/)).toBeInTheDocument()
        })

        test('muestra la regla del tiempo limitado por turno', () =>{
            render(<HelpContent />)
            expect(screen.getByText(/Tienes un tiempo limitado para colocar tu ficha en cada ronda/)).toBeInTheDocument()
        })

        test('muestra la regla de fichas adyacentes', () =>{
            render(<HelpContent />)
            expect(screen.getByText(/Tus fichas deben estar conectadas entre sí/)).toBeInTheDocument()
        })
    })

    describe('Objetivo y condiciones de victoria', () => {
        test('menciona conectar los tres lados del tablero', () => {
            render(<HelpContent />)
            expect(screen.getByText(/toque los tres lados del tablero triangular/)).toBeInTheDocument()
        })

        test('muestra la condición de victoria', () => {
            render(<HelpContent />)
            expect(screen.getByText(/si consigues formar una línea continua de fichas azules/)).toBeInTheDocument()
        })

        test('muestra la condición de derrota', () => {
            render(<HelpContent />)
            expect(screen.getByText(/si el bot completa su línea ganadora primero/)).toBeInTheDocument()
        })
    }) 

    describe('Información del tablero', () => {
        test('describe el tablero como triangular', () => {
            render(<HelpContent />)
            expect(screen.getByText(/El tablero es triangular/)).toBeInTheDocument()
        })

        test('menciona las casillas hexagonales', () => {
            render(<HelpContent />)
            expect(screen.getByText(/dividido en casillas hexagonales/)).toBeInTheDocument()
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

        test('muestra el apartado Objetivo del Juego', () => {
            render(<HelpDialog open={true} onClose={vi.fn()} />)
            expect(screen.getByText('Objetivo del Juego')).toBeInTheDocument()
        })

        test('muestra el apartado El Tablero', () => {
            render(<HelpDialog open={true} onClose={vi.fn()} />)
            expect(screen.getByText('El Tablero')).toBeInTheDocument()
        })

        test('muestra el apartado Reglas del Juego', () => {
            render(<HelpDialog open={true} onClose={vi.fn()} />)
            expect(screen.getByText('Reglas del Juego')).toBeInTheDocument()
        })

        test('muestra el apartado Cómo Ganar o Perder', () => {
            render(<HelpDialog open={true} onClose={vi.fn()} />)
            expect(screen.getByText('Cómo Ganar o Perder')).toBeInTheDocument()
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
