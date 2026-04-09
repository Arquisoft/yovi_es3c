import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from '../pages/Login'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest'
import '@testing-library/jest-dom'
import { AuthProvider } from '../context/AuthContext'
import * as userService from '../services/userService'

// Mock de useNavigate
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock de userService
vi.mock('../services/userService', () => ({
  login: vi.fn(),
  register: vi.fn(),
  validateToken: vi.fn(),
}))

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
    // Mock validateToken para que no llame al backend
    vi.mocked(userService.validateToken).mockResolvedValue(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const renderComponent = async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthProvider>
    )

    // Esperar a que AuthProvider termine de cargar y el formulario esté visible
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
    }, { timeout: 2000 })
  }

  test('login correcto redirige al dashboard', async () => {
    const user = userEvent.setup()

    // Mock de login exitoso
    vi.mocked(userService.login).mockResolvedValue({
      message: 'Login correcto',
      token: 'dummy-token',
      id: '123',
      username: 'prueba3',
    })

    await renderComponent()

    await user.type(screen.getByLabelText(/usuario/i), 'prueba3')
    await user.type(screen.getByLabelText(/contraseña/i), 'prueba3')

    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  test('muestra error si el servidor devuelve error', async () => {
    const user = userEvent.setup()

    // Mock de login con error
    vi.mocked(userService.login).mockRejectedValue(new Error('Credenciales inválidas'))

    await renderComponent()

    await user.type(screen.getByLabelText(/usuario/i), 'prueba3')
    await user.type(screen.getByLabelText(/contraseña/i), 'incorrecta')

    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument()
    })
  })

  test('muestra error si faltan campos', async () => {
    const user = userEvent.setup()

    await renderComponent()

    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(screen.getByText(/todos los campos son obligatorios/i)).toBeInTheDocument()
  })
})
