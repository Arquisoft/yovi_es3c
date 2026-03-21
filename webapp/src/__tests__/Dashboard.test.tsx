import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dashboard } from '../pages/Dashboard';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom'; // Enruta sin necesidad de un servidsor (solo para pruebas)
import { useAuth } from '../context/AuthContext';
import * as gameService from '../services/gameService';
import '@testing-library/jest-dom';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// Simula el servicio que obtiene las estadísticas del usuario.
vi.mock('../services/gameService', () => ({
  getUserStats: vi.fn(),
}));

describe('Dashboard Component - Usability & Logic', () => {
  // Datos de prueba.
  const mockUser = { username: 'PabloTest' };
  const mockStats = { username: 'PabloTest', totalGames: 10, gamesWon: 7, gamesLost: 3 };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({ user: mockUser });
    (gameService.getUserStats as any).mockResolvedValue(mockStats);
    localStorage.clear();
  });

  /**
   * Verifica que las estadísticas se cargan correctamente
   * y se muestra la información en las estructuras HTML esperadas.
   */
  it('debería mostrar carga y luego las estadísticas del usuario correctamente estructuradas', async () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);

    // 1 - Mensaje de carga.
    expect(screen.getByText(/cargando estadísticas/i)).toBeInTheDocument();
    // 2 - Esperar a que las estadísticas aparezcan
    await screen.findByText('Estadísticas globales');
    // 3 - Verifica que el título sea el correcto - Heading principal (h2)
    const heading = screen.getByRole('heading', { name: /estadísticas globales/i });
    expect(heading).toBeInTheDocument();
    // 4 - Verificar que las 4 tarjetas (StatCards) existen.
    const statCardContainers = document.querySelectorAll('.stat-card');
    expect(statCardContainers.length).toBe(4);
    // 5 - Verificar contenido específico de cada tarjeta

    // 5.1 - Usuario - buscar en StatCard de tipo "neutral"
    const userStatCard = document.querySelector('.stat-card.neutral');
    expect(userStatCard?.querySelector('.stat-label')).toHaveTextContent(/usuario/i);
    expect(userStatCard?.querySelector('.stat-value')).toHaveTextContent('PabloTest');
    // 5.2 -Total Partidas - buscar en StatCard de tipo "partidas"
    const totalStatCard = document.querySelector('.stat-card.partidas');
    expect(totalStatCard?.querySelector('.stat-label')).toHaveTextContent(/total partidas/i);
    expect(totalStatCard?.querySelector('.stat-value')).toHaveTextContent('10');
    // 5.3 - Partidas Ganadas - buscar en StatCard de tipo "win"
    const winStatCard = document.querySelector('.stat-card.win');
    expect(winStatCard?.querySelector('.stat-label')).toHaveTextContent(/ganadas partidas/i);
    expect(winStatCard?.querySelector('.stat-value')).toHaveTextContent('7');
    // 5.4 - Partidas Perdidas - buscar en StatCard de tipo "loss"
    const lossStatCard = document.querySelector('.stat-card.loss');
    expect(lossStatCard?.querySelector('.stat-label')).toHaveTextContent(/perdidas partidas/i);
    expect(lossStatCard?.querySelector('.stat-value')).toHaveTextContent('3');
    // 6 - Verificar iconos SVG - Cada tarjeta debe tener un SVG
    expect(userStatCard?.querySelector('svg')).toBeInTheDocument();
    expect(totalStatCard?.querySelector('svg')).toBeInTheDocument();
    expect(winStatCard?.querySelector('svg')).toBeInTheDocument();
    expect(lossStatCard?.querySelector('svg')).toBeInTheDocument();
  });

  /**
   * Verifica que al seleccionar cada dificultad, solo se muestran las estrategias correctas para esa dificultad.
   */
  it('debería mostrar solo la estrategia correcta para cada dificultad', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Dashboard /></MemoryRouter>);

    // 1. Esperamos a que el Dashboard esté listo
    await screen.findByText('10');

    // ====== TEST DIFICULTAD: FÁCIL ======
    const botonFacil = screen.getByRole('button', { name: /fácil/i });
    await user.click(botonFacil);
    expect(botonFacil).toHaveClass('selected');
    const botAleatoriofacil = await screen.findByText(/aleatorio/i);
    expect(botAleatoriofacil).toBeInTheDocument();
    expect(screen.queryByText(/defensivo/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/montecarlo/i)).not.toBeInTheDocument();

    // ====== TEST DIFICULTAD: MEDIO ======
    const botonMedio = screen.getByRole('button', { name: /media/i });
    await user.click(botonMedio);
    expect(botonMedio).toHaveClass('selected');
    const botDefensivoMedio = await screen.findByText(/defensivo/i);
    expect(botDefensivoMedio).toBeInTheDocument();
    expect(screen.queryByText(/aleatorio/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/montecarlo/i)).not.toBeInTheDocument();

    // ====== TEST DIFICULTAD: DIFÍCIL ======
    const botonDificil = screen.getByRole('button', { name: /difícil/i });
    await user.click(botonDificil);
    expect(botonDificil).toHaveClass('selected');
    const botMontecarloDificil = await screen.findByText(/montecarlo/i);
    expect(botMontecarloDificil).toBeInTheDocument();
  });

  /**
  * Comprueba que la información seleccionada en el formulario (dificultad, estrategia y tamaño) se guarda correctamente en localStorage
  * para que pueda ser recuperada en la pantalla del juego.
  */
  it('debería persistir la configuración completa en localStorage (dificultad, estrategia y tamaño)', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    await screen.findByText('10');

    const botonMedio = screen.getByRole('button', { name: /media/i });
    await user.click(botonMedio);
    await screen.findByText(/defensivo/i);
    const botDefensivo = screen.getByRole('button', { name: /defensivo/i });
    await user.click(botDefensivo);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '14' } });

    expect(localStorage.getItem('setup-dificultad')).toBe('media');
    expect(localStorage.getItem('setup-estrategia')).toBe('defensive_bot');
    expect(localStorage.getItem('setup-tamano')).toBe('14');
  });


  /**
  * Verifica que al hacer clic en "Jugar", se navega a la pantalla del juego (/game) y que además se pasa la configuración seleccionada 
  * con los parámetros correctos (dificultad, estrategia y tamaño).
  */
  it('debería navegar a /game con la configuración seleccionada al dar a Jugar', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    await screen.findByText('10');

    const botonMedio = screen.getByRole('button', { name: /media/i });
    await user.click(botonMedio);
    await screen.findByText(/defensivo/i);
    const botDefensivo = screen.getByRole('button', { name: /defensivo/i });
    await user.click(botDefensivo);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '15' } });
    const botonJugar = screen.getByRole('button', { name: /jugar/i });
    await user.click(botonJugar);
    expect(mockNavigate).toHaveBeenCalledWith('/game', expect.objectContaining({
      state: expect.objectContaining({
        difficulty: 'media',
        size: 15,
        botId: 'defensive_bot'
      })
    }));
  });
});