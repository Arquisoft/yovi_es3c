import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Register from '../pages/Register'
import { afterEach, describe, expect, test, vi } from 'vitest' 
import { MemoryRouter } from 'react-router-dom'
import '@testing-library/jest-dom'

// Mock de useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})


describe('Register Component', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const renderComponent = () => render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );

  test('sube los datos correctamente y muestra el link de inicio de sesión', async () => {
    const user = userEvent.setup()

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Éxito' }),
    } as Response)

    renderComponent()

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
    renderComponent()

    const userInput = screen.getByText(/usuario:/i).nextElementSibling as HTMLInputElement
    const passInput = screen.getByText(/^contraseña:/i).nextElementSibling as HTMLInputElement
    const confirmInput = screen.getByText(/confirmar contraseña:/i).nextElementSibling as HTMLInputElement

    await user.type(userInput, 'Pablo')
    await user.type(passInput, '123456')
    await user.type(confirmInput, '654321') // Diferente

   global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Las contraseñas no coinciden' }),
    } as Response)

    await user.click(screen.getByRole('button', { name: /registrarse/i }))


    await waitFor(() => {
      expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument()
    })
  })
})