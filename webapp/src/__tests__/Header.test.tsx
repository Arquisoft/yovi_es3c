// webapp/src/__tests__/Header.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Header } from '../components/Header';
import '@testing-library/jest-dom';

// Mock del AuthContext (solo useAuth)
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Import tipado del mock
import { useAuth } from '../context/AuthContext';

describe('Header component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Por defecto: invitado
    (useAuth as any).mockReturnValue({ user: null, logout: vi.fn() });
  });

  it('muestra enlaces básicos y "Iniciar Sesión" cuando no hay user', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText(/jugar/i)).toBeInTheDocument();
    expect(screen.getByText(/ranking/i)).toBeInTheDocument();
    expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument();
    expect(screen.queryByText(/cerrar sesión/i)).not.toBeInTheDocument();
  });

  it('muestra username y permite logout cuando hay user', async () => {
    const logoutMock = vi.fn();
    (useAuth as any).mockReturnValue({
      user: { username: 'pablo' },
      logout: logoutMock,
    });

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText(/pablo/i)).toBeInTheDocument();

    const cerrar = screen.getByText(/cerrar sesión/i);
    expect(cerrar).toBeInTheDocument();

    await user.click(cerrar);
    expect(logoutMock).toHaveBeenCalled();
  });

  it('los enlaces usan las rutas esperadas', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const jugar = screen.getByText(/jugar/i).closest('a');
    const ranking = screen.getByText(/ranking/i).closest('a');

    expect(jugar).toHaveAttribute('href', '/dashboard');
    expect(ranking).toHaveAttribute('href', '/ranking');
  });

  it('renderiza correctamente el Header sin usar snapshot', () => {
    const { container } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    // 🔥 CAMBIO 1:
    // Comprobamos que el header existe
    expect(container.querySelector('header')).toBeInTheDocument();

    // 🔥 CAMBIO 2:
    // Comprobamos que los enlaces principales están presentes
    expect(screen.getByText(/jugar/i)).toBeInTheDocument();
    expect(screen.getByText(/ranking/i)).toBeInTheDocument();

    // 🔥 CAMBIO 3:
    // Comprobamos que el botón de iniciar sesión aparece para invitados
    expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument();
  });
});
