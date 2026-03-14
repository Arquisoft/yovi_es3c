import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from '../pages/Login'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test, vi, afterEach } from 'vitest'
import '@testing-library/jest-dom'

// Mock de useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

describe('Login Component', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

  // ---------------------------------------------------------
  // 1. LOGIN CORRECTO (redirige a /dashboard)
  // ---------------------------------------------------------
  test('login correcto redirige al dashboard', async () => {
    const user = userEvent.setup()
    const mockNavigate = vi.fn()

    vi.mocked(require('react-router-dom').useNavigate).mockReturnValue(mockNavigate)

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Login correcto' }),
    } as Response)

    renderComponent()

    await user.type(screen.getByLabelText(/usuario/i), 'prueba3')
    await user.type(screen.getByLabelText(/contraseña/i), 'prueba3')

    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  // ---------------------------------------------------------
  // 2. ERROR DEL SERVIDOR (credenciales incorrectas)
  // ---------------------------------------------------------
  test('muestra error si el servidor devuelve error', async () => {
    const user = userEvent.setup()

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Credenciales inválidas' }),
    } as Response)

    renderComponent()

    await user.type(screen.getByLabelText(/usuario/i), 'prueba3')
    await user.type(screen.getByLabelText(/contraseña/i), 'incorrecta')

    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------
  // 3. CAMPOS VACÍOS
  // ---------------------------------------------------------
  test('muestra error si faltan campos', async () => {
    const user = userEvent.setup()

    renderComponent()

    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(screen.getByText(/todos los campos son obligatorios/i)).toBeInTheDocument()
  })
})
