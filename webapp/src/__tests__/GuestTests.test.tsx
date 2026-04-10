import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dashboard } from '../pages/Dashboard';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as gameService from '../services/gameService';
import '@testing-library/jest-dom';

// JSDOM no implementa showModal(), así que lo mockeamos
HTMLDialogElement.prototype.showModal = vi.fn();
HTMLDialogElement.prototype.close = vi.fn();

// Mock de AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock de navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// Mock del servicio de estadísticas
vi.mock('../services/gameService', () => ({
  getUserStats: vi.fn(),
}));

describe('Guest Flow - Dashboard (usuario invitado)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    (useAuth as any).mockReturnValue({ user: null });
  });

  // ============================================================
  // 1. Invitado NO debe cargar estadísticas
  // ============================================================
  it('no carga estadísticas ni muestra UserStats cuando user === null', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);

    // No aparece el texto de carga
    expect(screen.queryByText(/cargando estadísticas/i)).not.toBeInTheDocument();

    // No se llama al servicio
    expect(gameService.getUserStats).not.toHaveBeenCalled();

    // No aparece UserStats
    expect(screen.queryByText(/estadísticas globales/i)).not.toBeInTheDocument();
  });

  // ============================================================
  // 2. Invitado puede iniciar partida
  // ============================================================
  it('el invitado puede iniciar partida y navegar a /game', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Dashboard /></MemoryRouter>);

    // Cambiar dificultad → media
    const botonMedio = screen.getByRole('button', { name: /media/i });
    await user.click(botonMedio);

    // Elegir estrategia defensiva
    const botDefensivo = await screen.findByRole('button', { name: /defensivo/i });
    await user.click(botDefensivo);

    // Cambiar tamaño
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '14' } });

    // Click en Jugar
    const botonJugar = screen.getByRole('button', { name: /jugar/i });
    await user.click(botonJugar);

    expect(mockNavigate).toHaveBeenCalledWith('/game', expect.objectContaining({
      state: expect.objectContaining({
        difficulty: 'media',
        size: 14,
        botId: 'defensive_bot'
      })
    }));
  });

  // ============================================================
  // 3. Invitado puede abrir el diálogo de ayuda
  // ============================================================
  it('el invitado puede abrir el diálogo de ayuda', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Dashboard /></MemoryRouter>);

    const helpBtn = screen.getByRole('button', { name: /ver ayuda/i });
    await user.click(helpBtn);

    expect(screen.getByText(/reglas/i)).toBeInTheDocument();
  });

  // ============================================================
  // 4. Snapshot para subir coverage
  // ============================================================
  it('snapshot del dashboard como invitado', () => {
    const { container } = render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(container).toMatchSnapshot();
  });
});

// ============================================================
// 5. Usuario autenticado sin username → error "Usuario no autenticado"
// ============================================================
it('muestra error si user existe pero no tiene username', async () => {
  (useAuth as any).mockReturnValue({ user: {} }); // user sin username
  (gameService.getUserStats as any).mockResolvedValue(null);

  render(<MemoryRouter><Dashboard /></MemoryRouter>);

  expect(await screen.findByText(/usuario no autenticado/i)).toBeInTheDocument();
  expect(gameService.getUserStats).not.toHaveBeenCalled();
});

// ============================================================
// 6. Error al cargar estadísticas → cubre catch (líneas 62–63)
// ============================================================
it('muestra mensaje de error si getUserStats falla', async () => {
  (useAuth as any).mockReturnValue({ user: { username: "pablo" } });
  (gameService.getUserStats as any).mockRejectedValue(new Error("fail"));

  render(<MemoryRouter><Dashboard /></MemoryRouter>);

  expect(await screen.findByText(/no se pudieron cargar las estadísticas/i)).toBeInTheDocument();
});

// ============================================================
// 7. userStats === null pero user existe → cubre línea 92
// ============================================================
it('muestra UserStats vacío cuando user existe pero no hay estadísticas', async () => {
  (useAuth as any).mockReturnValue({ user: { username: "pablo" } });
  (gameService.getUserStats as any).mockResolvedValue(null);

  render(<MemoryRouter><Dashboard /></MemoryRouter>);

  expect(await screen.findByText(/estadísticas globales/i)).toBeInTheDocument();
});

// ============================================================
// 8. loading === true → cubre línea 101
// ============================================================
it('muestra "Cargando estadísticas..." mientras loading es true', () => {
  (useAuth as any).mockReturnValue({ user: { username: "pablo" } });

  // No resolvemos la promesa → loading permanece true
  (gameService.getUserStats as any).mockImplementation(() => new Promise(() => {}));

  render(<MemoryRouter><Dashboard /></MemoryRouter>);

  expect(screen.getByText(/cargando estadísticas/i)).toBeInTheDocument();
});

