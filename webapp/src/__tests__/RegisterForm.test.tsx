import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RegisterForm from '../screens/authentication/RegisterForm'
import { afterEach, describe, expect, test, vi } from 'vitest' 
import '@testing-library/jest-dom'

describe('RegisterForm', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('muestra error de validación cuando los campos están vacíos', async () => {
    render(<RegisterForm onSuccess={() => {}} />)
    const user = userEvent.setup()

    // Usamos "Crear cuenta" que es el texto de tu botón
    const submitBtn = screen.getByRole('button', { name: /crear cuenta/i })
    await user.click(submitBtn)

    await waitFor(() => {
      // Tu componente devuelve este mensaje exacto si los campos están vacíos
      expect(screen.getByText(/todos los campos son obligatorios/i)).toBeInTheDocument()
    })
  })

  test('sube los datos correctamente y muestra mensaje de éxito', async () => {
    const user = userEvent.setup()
    const onSuccessMock = vi.fn()

    // Mock de fetch para simular la respuesta del backend
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        message: 'Usuario creado correctamente', 
        username: 'Pablo' 
      }),
    } as Response)

    render(<RegisterForm onSuccess={onSuccessMock} />)

    // Ajustado a tus labels exactos: "Nombre de usuario", "Contraseña" y "Repetir contraseña"
    await user.type(screen.getByLabelText(/nombre de usuario/i), 'Pablo')
    await user.type(screen.getByLabelText(/^contraseña$/i), 'password123')
    await user.type(screen.getByLabelText(/repetir contraseña/i), 'password123')

    await user.click(screen.getByRole('button', { name: /crear cuenta/i }))

    // Verificamos que aparezca el mensaje de éxito que devuelve el mock
    await waitFor(() => {
      expect(screen.getByText(/usuario creado correctamente/i)).toBeInTheDocument()
    })

    // Verificamos que se llamó a la función onSuccess con el nombre correcto
    expect(onSuccessMock).toHaveBeenCalledWith('Pablo')
  })

  test('muestra error si las contraseñas no coinciden', async () => {
    const user = userEvent.setup()
    render(<RegisterForm onSuccess={() => {}} />)

    await user.type(screen.getByLabelText(/nombre de usuario/i), 'Pablo')
    await user.type(screen.getByLabelText(/^contraseña$/i), '123456')
    await user.type(screen.getByLabelText(/repetir contraseña/i), '654321')

    await user.click(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => {
      expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument()
    })
  })
})