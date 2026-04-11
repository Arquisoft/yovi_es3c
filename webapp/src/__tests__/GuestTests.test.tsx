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
  it('renderiza correctamente el dashboard como invitado sin usar snapshot', () => {
  render(<MemoryRouter><Dashboard /></MemoryRouter>);

  // Comprobamos que los botones de dificultad existen
  expect(screen.getByRole('button', { name: /fácil/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /media/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /difícil/i })).toBeInTheDocument();

  // Comprobamos que el botón de jugar existe
  expect(screen.getByRole('button', { name: /jugar/i })).toBeInTheDocument();

  // Comprobamos que NO aparece UserStats
  expect(screen.queryByText(/estadísticas globales/i)).not.toBeInTheDocument();
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

// ============================================================
// EXTRA: Login - cubre rama response.ok === false
// ============================================================
it('Login muestra error del servidor cuando response.ok es false', async () => {
  const user = userEvent.setup();

  // Mock de login del contexto
  (useAuth as any).mockReturnValue({ login: vi.fn() });

  // Mock del fetch devolviendo error
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    json: () => Promise.resolve({ error: "Credenciales inválidas" })
  });

  const { default: Login } = await import('../pages/Login');

  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

  await user.type(screen.getByLabelText(/usuario/i), "pablo");
  await user.type(screen.getByLabelText(/contraseña/i), "1234");

  await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

  expect(await screen.findByText(/credenciales inválidas/i)).toBeInTheDocument();
});

// ============================================================
// EXTRA: AuthContext - carga inicial y logout
// ============================================================
it('AuthContext carga usuario desde token JWT válido y permite logout', async () => {
  // Mock userService.validateToken para devolver un usuario cuando hay token
  const userServiceModule = await vi.importActual<typeof import('../services/userService')>(
    '../services/userService'
  );
  
  vi.spyOn(userServiceModule, 'validateToken').mockResolvedValue({
    id: "1",
    username: "pablo"
  });

  // Guardar token en localStorage (simular sesión activa)
  localStorage.setItem('token', 'jwt-token-123');

  const realAuth = await vi.importActual<typeof import('../context/AuthContext')>(
    '../context/AuthContext'
  );
  const { AuthProvider, useAuth } = realAuth;
  const { renderHook, act } = await import('@testing-library/react');

  const wrapper = ({ children }: any) => <AuthProvider>{children}</AuthProvider>;
  const { result } = renderHook(() => useAuth(), { wrapper });

  // Esperar a que valide el token
  await new Promise(resolve => setTimeout(resolve, 0));

  expect(result.current.user).toEqual({ id: "1", username: "pablo" });

  act(() => {
    result.current.logout();
  });

  expect(result.current.user).toBeNull();
  expect(localStorage.getItem('token')).toBeNull();
});

// ============================================================
// EXTRA: AuthContext - error fuera del provider
// ============================================================
it('useAuth lanza error si se usa fuera del AuthProvider', async () => {
  const realAuth = await vi.importActual<typeof import('../context/AuthContext')>(
    '../context/AuthContext'
  );
  const { useAuth } = realAuth;
  const { renderHook } = await import('@testing-library/react');

  expect(() => renderHook(() => useAuth())).toThrow(
    /useAuth debe usarse dentro de un AuthProvider/i
  );
});






