import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import app from '../users-service.js'
import User from '../models/User.js'

describe('POST /createuser', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // --- CASO 1: TODO CORRECTO ---
    it('debería crear un usuario correctamente (201)', async () => {
        vi.spyOn(User, 'findOne').mockResolvedValue(null);
        const saveSpy = vi.spyOn(User.prototype, 'save').mockResolvedValue({
            username: 'Pablo',
            _id: '12345'
        });

        const res = await request(app)
            .post('/createuser')
            .send({ 
                username: 'Pablo', 
                password: '123', 
                confirmPassword: '123' 
            });

        expect(res.status).toBe(201);
        expect(res.body.message).toContain('Usuario creado con éxito');
        expect(saveSpy).toHaveBeenCalled();
    });

    // --- CASO 2: USUARIO REPETIDO ---
    it('debería fallar si el usuario ya existe (409)', async () => {
        // Simulamos que findOne ENCUENTRA algo
        vi.spyOn(User, 'findOne').mockResolvedValue({ username: 'Pablo' });

        const res = await request(app)
            .post('/createuser')
            .send({ 
                username: 'Pablo', 
                password: '123', 
                confirmPassword: '123' 
            });

        expect(res.status).toBe(409);
        expect(res.body.error).toBe('El nombre de usuario ya está en uso');
    });

    // --- CASO 3: CONTRASEÑAS NO COINCIDEN ---
    it('debería fallar si las contraseñas no coinciden (400)', async () => {
        const res = await request(app)
            .post('/createuser')
            .send({ 
                username: 'Maria', 
                password: '123', 
                confirmPassword: '999' 
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Las contraseñas no coinciden');
    });

    // --- CASO 4: CAMPOS FALTANTES (MAP) ---
    const camposTest = [
        { desc: 'falta username', body: { password: '123', confirmPassword: '123' } },
        { desc: 'falta password', body: { username: 'pablo', confirmPassword: '123' } },
        { desc: 'falta confirmPassword', body: { username: 'pablo', password: '123' } }
    ];

    camposTest.forEach(({ desc, body }) => {
        it(`debería devolver 400 si ${desc}`, async () => {
            const res = await request(app).post('/createuser').send(body);
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Todos los campos son obligatorios');
        });
    });

    // --- CASO 5: INTENTO DE INYECCIÓN NOSQL ---
    it('debería rechazar un intento de inyección NoSQL (400)', async () => {
        // Un atacante intenta enviar un objeto con un operador de MongoDB ($ne: "not equal")
        // para intentar saltarse la validación o descubrir usuarios.
        const res = await request(app)
            .post('/createuser')
            .send({ 
                username: { $ne: null }, 
                password: '123', 
                confirmPassword: '123' 
            });

        // Gracias a tu validación 'typeof !== string', esto debería devolver 400
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Datos de entrada inválidos');
        
        // Verificamos que NI SIQUIERA se llamó a la base de datos
        const findOneSpy = vi.spyOn(User, 'findOne');
        expect(findOneSpy).not.toHaveBeenCalled();
    });

    // --- CASO 6: ERROR INTERNO  ---
    it('debería devolver 500 si la base de datos falla inesperadamente', async () => {
        // Forzamos un error real que caiga en el bloque 'catch'
        vi.spyOn(User, 'findOne').mockRejectedValue(new Error('Fallo crítico de conexión'));

        const res = await request(app)
            .post('/createuser')
            .send({ 
                username: 'Pablo', 
                password: '123', 
                confirmPassword: '123' 
            });

        expect(res.status).toBe(500);
        expect(res.body.error).toBe('Error interno del servidor');
    });
});