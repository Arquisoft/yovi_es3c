import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose' // <--- Importa mongoose
import app from '../users-service.js'
import User from '../models/User.js'

// 1. Mock de la conexión de Mongoose para que no intente conectar a Atlas
vi.mock('mongoose', async () => {
  const actual = await vi.importActual('mongoose')
  return {
    ...actual,
    connect: vi.fn().mockResolvedValue(true),
  }
})

describe('POST /createuser', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('debería crear un usuario correctamente y devolver 201', async () => {
        // Forzamos el mock del save
        const saveSpy = vi.spyOn(User.prototype, 'save').mockResolvedValue({
            username: 'Pablo',
            _id: '12345'
        });

        const res = await request(app)
            .post('/createuser')
            .send({ 
                username: 'Pablo', 
                password: 'password123',
                confirmPassword: 'password123' 
            });

        expect(res.status).toBe(201);
        expect(res.body.message).toContain('Usuario creado con éxito');
        expect(saveSpy).toHaveBeenCalled();
    }, 10000); // <-- Subimos el timeout a 10s por si el arranque es lento

    it('debería fallar si las contraseñas no coinciden', async () => {
        const res = await request(app)
            .post('/createuser')
            .send({ 
                username: 'Pablo', 
                password: 'password123',
                confirmPassword: 'otraPassword' 
            })

        expect(res.status).toBe(400)
        expect(res.body.error).toBe('Las contraseñas no coinciden')
    })
})