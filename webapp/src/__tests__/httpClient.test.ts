import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest'
import { httpClient } from '../utils/httpClient'

describe('httpClient', () => {
  const mockUrl = 'http://api.example.com/test'
  const mockToken = 'test-jwt-token'

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.spyOn(window, 'fetch')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('debería hacer GET sin token', async () => {
    const mockResponse = new Response(JSON.stringify({ data: 'test' }), {
      status: 200
    })

    vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse)

    const response = await httpClient(mockUrl, { method: 'GET' })

    expect(global.fetch).toHaveBeenCalledWith(
      mockUrl,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      })
    )
    expect(response.status).toBe(200)
  })

  test('debería hacer GET con token', async () => {
    localStorage.setItem('token', mockToken)

    const mockResponse = new Response(JSON.stringify({ data: 'test' }), {
      status: 200
    })

    vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse)

    await httpClient(mockUrl, { method: 'GET' })

    expect(global.fetch).toHaveBeenCalledWith(
      mockUrl,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        })
      })
    )
  })

  test('debería hacer POST con datos', async () => {
    localStorage.setItem('token', mockToken)

    const body = JSON.stringify({ name: 'test' })
    const mockResponse = new Response(JSON.stringify({ id: 1 }), {
      status: 201
    })

    vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse)

    const response = await httpClient(mockUrl, {
      method: 'POST',
      body
    })

    expect(global.fetch).toHaveBeenCalledWith(
      mockUrl,
      expect.objectContaining({
        method: 'POST',
        body,
        headers: expect.objectContaining({
          Authorization: `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        })
      })
    )
    expect(response.status).toBe(201)
  })

  test('debería manejar 401 y redirigir a login', async () => {
    localStorage.setItem('token', mockToken)

    const mockResponse = new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401
    })

    vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse)

    delete (window as any).location
    window.location = { href: '' } as any

    await expect(httpClient(mockUrl)).rejects.toThrow('Token expirado. Redirigiendo a login...')

    expect(localStorage.getItem('token')).toBeNull()
    expect(window.location.href).toBe('/login?session=expired')
  })

  test('debería NO redirigir cuando skipAuth es true', async () => {
    const mockResponse = new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401
    })

    vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse)

    delete (window as any).location
    window.location = { href: '' } as any

    const response = await httpClient(mockUrl, { skipAuth: true })

    expect(response.status).toBe(401)
    expect(window.location.href).toBe('')
  })
})
