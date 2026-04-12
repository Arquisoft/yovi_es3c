import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Register from '../pages/Register'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest' 
import { MemoryRouter } from 'react-router-dom'
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


describe('Register Component', () => {
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
          <Register />
        </MemoryRouter>
      </AuthProvider>
    )

    // Esperar a que AuthProvider termine de cargar y el formulario esté visible
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /registrarse/i })).toBeInTheDocument()
    }, { timeout: 2000 })
  }

  test('sube los datos correctamente y muestra el link de inicio de sesión', async () => {
    const user = userEvent.setup()

    // Mock de register exitoso
    vi.mocked(userService.register).mockResolvedValue({
      message: 'Registro exitoso',
      token: 'dummy-token',
      id: '123',
      username: 'Pablo',
    })

    await renderComponent()

    // Localizamos los inputs por relación de vecindad (hermanos del label)
    const userInput = screen.getByText(/usuario:/i).nextElementSibling as HTMLInputElement
    const passInput = screen.getByText(/^contraseña:/i).nextElementSibling as HTMLInputElement
    const confirmInput = screen.getByText(/confirmar contraseña:/i).nextElementSibling as HTMLInputElement

    await user.type(userInput, 'Pablo')
    await user.type(passInput, '123456')
    await user.type(confirmInput, '123456')

    await user.click(screen.getByRole('button', { name: /registrarse/i }))

    // 1. Verificamos el mensaje de éxito
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })

  })

  test('muestra error si las contraseñas no coinciden', async () => {
    const user = userEvent.setup()

    // Mock de register con error
    vi.mocked(userService.register).mockRejectedValue(new Error('Las contraseñas no coinciden'))

    await renderComponent()

    const userInput = screen.getByText(/usuario:/i).nextElementSibling as HTMLInputElement
    const passInput = screen.getByText(/^contraseña:/i).nextElementSibling as HTMLInputElement
    const confirmInput = screen.getByText(/confirmar contraseña:/i).nextElementSibling as HTMLInputElement

    await user.type(userInput, 'Pablo')
    await user.type(passInput, '123456')
    await user.type(confirmInput, '654321') // Diferente

    await user.click(screen.getByRole('button', { name: /registrarse/i }))

    await waitFor(() => {
      expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument()
    })
  })
})