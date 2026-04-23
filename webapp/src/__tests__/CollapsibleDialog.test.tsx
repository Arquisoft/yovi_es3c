import '@testing-library/jest-dom'
import {render, screen, waitFor } from '@testing-library/react'
import {describe, expect, test, vi} from 'vitest'
import userEvent from '@testing-library/user-event';
import CollapsibleDialog from '../pages/CollapsibleDialog'


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

describe('CollapsibleDialog', () =>{

    describe('Boton del desplegable', () =>{

        test('se oculta el desplegable cuando se pulsa el boton', async () =>{
            render(<CollapsibleDialog {...defaultTestingProps}></CollapsibleDialog>)
            
            await userEvent.click(screen.getByText('Resultados de la partida'));
            
            await waitFor(() => {
                expect(screen.queryByText("Info de la partida")).not.toBeInTheDocument();
            });

            await new Promise(resolve => setTimeout(resolve, 500));

            await userEvent.click(screen.getByText('Resultados de la partida'));
            await waitFor(() => {
                expect(screen.queryByText("Info de la partida")).toBeInTheDocument();
            });

        });


    });
})