import '@testing-library/jest-dom'
import {render, screen, waitFor } from '@testing-library/react'
import {beforeEach, describe, expect, test, vi} from 'vitest'
import userEvent from '@testing-library/user-event';
import DialogResult from '../pages/DialogResult'
import { getGlobalRanking } from '../services/rankingService';


const defaultTestingProps = {
    won: true,
    loggedIn: false,
    newRecord: false,
    gameInfo: {
        duration: '3:13',
        movesMade: 12,
        score: 8000
    },
    onPlayAgain: vi.fn(),
    onGoHome: vi.fn()
};

vi.mock('../services/rankingService', () => ({
    getGlobalRanking: vi.fn()
}));

beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getGlobalRanking).mockResolvedValue([
        { _id: '1', username: 'Jugador1', score: 1000 },
        { _id: '2', username: 'Jugador2', score: 500 },
        { _id: '3', username: 'Jugador3', score: 150 },
        { _id: '4', username: 'Jugador4', score: 50 },
    ] as any);
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

describe('Ranking', () => {
    test('muestra el título del ranking', async() => {
        render(<DialogResult {...defaultTestingProps} />);
        expect(screen.getByText('Ranking')).toBeInTheDocument();
    });

    test('muestra "Cargando..." mientras se obtienen los datos', () => {
        // getGlobalRanking nunca resuelve en este test.
        vi.mocked(getGlobalRanking).mockReturnValueOnce(new Promise(() => {}));
        render(<DialogResult {...defaultTestingProps} />);
        expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

    test('muestra solo el top 3 tras cargar', async() => {
        render(<DialogResult {...defaultTestingProps} />);
        await waitFor(() => {
            expect(screen.getByText('Jugador1')).toBeInTheDocument();
            expect(screen.getByText('Jugador2')).toBeInTheDocument();
            expect(screen.getByText('Jugador3')).toBeInTheDocument();
            expect(screen.queryByText('Jugador4')).not.toBeInTheDocument();
        });
    });

    test('ordena por puntuación aunque el servicio devuelva datos desordenados', async () => {
        vi.mocked(getGlobalRanking).mockResolvedValueOnce([
            {_id: '3', username: 'Jugador3', score: 15},
            {_id: '1', username: 'Jugador1', score: 100},
            {_id: '2', username: 'Jugador2', score: 50},
        ] as any);
        render(<DialogResult {...defaultTestingProps} />);
        await waitFor(() => {
            const names = screen.getAllByText(/Jugador\d/).map(el => el.textContent);
            expect(names[0]).toBe('Jugador1');
            expect(names[1]).toBe('Jugador2');
            expect(names[2]).toBe('Jugador3');
        });
    });

    test('muestra la estrella en el usuario actual del ranking', async () => {
        render(<DialogResult {...defaultTestingProps} user={{ username: 'Jugador2' }} />);
        await waitFor(() => {
            expect(screen.getByText(/✪\s*Jugador2/)).toBeInTheDocument();
        });
    });

    test('muestra los emojis de medalla correctos', async () => {
        render(<DialogResult {...defaultTestingProps} />);
        await waitFor(() => {
            expect(screen.getByText('🥇')).toBeInTheDocument();
            expect(screen.getByText('🥈')).toBeInTheDocument();
            expect(screen.getByText('🥉')).toBeInTheDocument();
        });
    });

    test('muestra mensaje de error si el servicio falla.', async() => {
        vi.mocked(getGlobalRanking).mockRejectedValueOnce(new Error('Network error'));
        render(<DialogResult {...defaultTestingProps} />);
        await waitFor(() => {
            expect(screen.getByText('Error al cargar el ranking.')).toBeInTheDocument();
        });
    });

    test('no muestra "Cargando..." tras resolver', async () => {
        render(<DialogResult {...defaultTestingProps} />);
        await waitFor(() => {
            expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
        });
    });
})