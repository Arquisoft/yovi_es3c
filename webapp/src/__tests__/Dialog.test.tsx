import '@testing-library/jest-dom'
import {render, screen } from '@testing-library/react'
import {describe, expect, test, vi} from 'vitest'
import userEvent from '@testing-library/user-event';
import DialogResult from '../pages/DialogResult'

const defaultTestingProps = {
    won: true,
    loggedIn: false,
    newRecord: false,
    gameInfo: {
        duration: '3:13',
        movesMade: 12,
        score: 8000
    },
    ranking : [
        { position:1, name: 'Jugador1', score: '100'},
        { position: 2, name: 'Jugador2', score: '50'},
        { position: 3, name: 'Jugador3', score: '15'}
        ],
    onPlayAgain: vi.fn(),
    onGoHome: vi.fn()
};

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<any>('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate
    }
});

describe('DialogResult', () => {

    describe('Mensaje principal', () => {
        test('muestra el mensaje de victoria cuando won es true', () => {
            render(<DialogResult {...defaultTestingProps}></DialogResult>)
            expect(screen.getByText('¡Has ganado!')).toBeInTheDocument();
        });

        test('muestra el mensaje de derrota cuando won es false', () => {
            render(<DialogResult {...defaultTestingProps} won={false}></DialogResult>);
            expect(screen.getByText('¡Has perdido!')).toBeInTheDocument();
        });
    });

    describe('Mensajes secundarios', () => {
        
        test('muestra la duración de la partida correctamente', () => {
            render(<DialogResult {...defaultTestingProps}></DialogResult>);
            expect(screen.getByText('Duración')).toBeInTheDocument();
            expect(screen.getByText('3:13')).toBeInTheDocument();
        });
    
        test('muestra el numero de movimientos realizados durante la partida correctamente', () => {
            render(<DialogResult {...defaultTestingProps}></DialogResult>);
            expect(screen.getByText('Movimientos')).toBeInTheDocument();
            expect(screen.getByText('12')).toBeInTheDocument();
        });
        
        describe('Mensaje de puntuación', () => {

            test('muestra la puntuación del usuario, SIN mensaje de nuevo record', () => {
                render(<DialogResult {...defaultTestingProps}></DialogResult>);
                expect(screen.getByText('Puntuación')).toBeInTheDocument();
                expect(screen.getByText('8000')).toBeInTheDocument();
                expect(screen.queryByText('¡NUEVO RECORD PERSONAL!')).not.toBeInTheDocument();
            });
    
            test('muestra la puntuación del usuario, CON el mensaje de nuevo record', () => {
                render(<DialogResult {...defaultTestingProps} newRecord={true}></DialogResult>);
                expect(screen.getByText('Puntuación')).toBeInTheDocument();
                expect(screen.getByText('8000')).toBeInTheDocument();
                expect(screen.queryByText('¡NUEVO RECORD PERSONAL!')).toBeInTheDocument();
            });

        });


        describe('Mensaje de login', () => {

            test('el mensaje de login se muestra si loggedIn es false', () => {
                render(<DialogResult {...defaultTestingProps} loggedIn={false}></DialogResult>);
                expect(screen.getByText('Inicia sesión para guardar tu puntuación')).toBeInTheDocument();
            });

            test('el mensaje de login no se muestra si loggedIn es true', () => {
                render(<DialogResult {...defaultTestingProps} loggedIn={true}></DialogResult>);
                expect(screen.queryByText('Inicia sesión para guardar tu puntuación')).not.toBeInTheDocument();
            });

        });
        
        
    });

    
    describe('Pruebas sobre los botones', () => {
        
        test('los botones se muestran correctamente', () => {
            render(<DialogResult {...defaultTestingProps}></DialogResult>);
            expect(screen.getByText('Jugar de nuevo')).toBeInTheDocument();
            expect(screen.getByText('Volver al inicio')).toBeInTheDocument();
        });

        test('llama a onPlayAgain al pulsar el primer botón', async () => {
            const onPlayAgain = vi.fn();
            render(<DialogResult {...defaultTestingProps} onPlayAgain={onPlayAgain}></DialogResult>);
            await userEvent.click(screen.getByText('Jugar de nuevo'));
            expect(onPlayAgain).toHaveBeenCalledOnce();
        });

        test('llama a onGomeHome al pulsar el segundo botón', async () => {
            const onGoHome = vi.fn();
            render(<DialogResult {...defaultTestingProps} onGoHome={onGoHome}></DialogResult>);
            expect(screen.getByText('Volver al inicio')).toBeInTheDocument();
            await userEvent.click(screen.getByText('Volver al inicio'));
            expect(onGoHome).toHaveBeenCalledOnce();
        });
    });

});