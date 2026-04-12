import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest'
import { login, register, validateToken } from '../services/userService'
import * as httpClientModule from '../utils/httpClient'

describe('userService', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.spyOn(httpClientModule, 'httpClient')
  })

  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  describe('login', () => {
    test('debería retornar token y datos del usuario en login exitoso', async () => {
      const mockResponse = {
        message: 'Login exitoso',
        token: 'jwt-token-123',
        id: 'user-id-123',
        username: 'testuser'
      }

      vi.mocked(httpClientModule.httpClient).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await login('testuser', 'password123')

      expect(result).toEqual(mockResponse)
      expect(result.token).toBe('jwt-token-123')
      expect(httpClientModule.httpClient).toHaveBeenCalledWith(
        'http://localhost:3000/login',
        expect.objectContaining({
          method: 'POST',
          skipAuth: true
        })
      )
    })

    test('debería lanzar error con credenciales inválidas', async () => {
      const errorResponse = { error: 'Credenciales inválidas' }

      vi.mocked(httpClientModule.httpClient).mockResolvedValueOnce({
        ok: false,
        json: async () => errorResponse
      } as Response)

      await expect(login('testuser', 'wrongpassword')).rejects.toThrow('Credenciales inválidas')
    })
  })

  describe('register', () => {
    test('debería registrar nuevo usuario exitosamente', async () => {
      const mockResponse = {
        message: 'Usuario creado',
        token: 'jwt-token-456',
        id: 'user-id-456',
        username: 'newuser'
      }

      vi.mocked(httpClientModule.httpClient).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await register('newuser', 'password123', 'password123')

      expect(result).toEqual(mockResponse)
      expect(httpClientModule.httpClient).toHaveBeenCalledWith(
        'http://localhost:3000/createuser',
        expect.objectContaining({
          method: 'POST',
          skipAuth: true,
          body: JSON.stringify({ username: 'newuser', password: 'password123', confirmPassword: 'password123' })
        })
      )
    })

    test('debería lanzar error cuando las contraseñas no coinciden', async () => {
      const errorResponse = { error: 'Las contraseñas no coinciden' }

      vi.mocked(httpClientModule.httpClient).mockResolvedValueOnce({
        ok: false,
        json: async () => errorResponse
      } as Response)

      await expect(register('newuser', 'password123', 'password456')).rejects.toThrow('Las contraseñas no coinciden')
    })
  })

  describe('validateToken', () => {
    test('debería retornar null cuando no hay token', async () => {
      const result = await validateToken()

      expect(result).toBeNull()
      expect(httpClientModule.httpClient).not.toHaveBeenCalled()
    })

    test('debería retornar datos del usuario con token válido', async () => {
      localStorage.setItem('token', 'valid-token')

      const mockResponse = {
        valid: true,
        id: 'user-id-123',
        username: 'testuser'
      }

      vi.mocked(httpClientModule.httpClient).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await validateToken()

      expect(result).toEqual({
        id: 'user-id-123',
        username: 'testuser'
      })
      expect(httpClientModule.httpClient).toHaveBeenCalledWith(
        'http://localhost:3000/validate',
        expect.objectContaining({ method: 'GET' })
      )
    })

    test('debería retornar null cuando el token es inválido', async () => {
      localStorage.setItem('token', 'expired-token')

      vi.mocked(httpClientModule.httpClient).mockResolvedValueOnce({
        ok: false
      } as Response)

      const result = await validateToken()

      expect(result).toBeNull()
    })

    test('debería remover token y retornar null en caso de error en validación', async () => {
      localStorage.setItem('token', 'some-token')

      vi.mocked(httpClientModule.httpClient).mockRejectedValueOnce(new Error('Network error'))

      const result = await validateToken()

      expect(result).toBeNull()
      expect(localStorage.getItem('token')).toBeNull()
    })
  })
})
