import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import User from '../models/User.js'

// Mock GLOBAL de bcryptjs - CommonJS
vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
    genSalt: vi.fn(),
    hash: vi.fn()
  }
}))

// Importar app DESPUÉS del mock
import app from '../users-service.js'
import bcryptjs from 'bcryptjs'

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

    // --- CASO 6: INTENTO DE INYECCIÓN NOSQL ---
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
    });

    // --- CASO 7: PASSWORD NO ES STRING ---
    it('debería rechazar si password no es string', async () => {
        const res = await request(app)
            .post('/createuser')
            .send({ 
                username: 'testuser', 
                password: 123,  // número, no string
                confirmPassword: '123' 
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Datos de entrada inválidos');
    });

    // --- CASO 8: CONFIRMAR PASSWORD NO ES STRING ---
    it('debería rechazar si confirmPassword no es string', async () => {
        const res = await request(app)
            .post('/createuser')
            .send({ 
                username: 'testuser', 
                password: '123',
                confirmPassword: true  // boolean, no string
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Datos de entrada inválidos');
    });

    // --- CASO 9: ERROR INTERNO  ---
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

describe('POST /login', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // --- CASO 1: CAMPOS FALTANTES ---
    const camposTestLogin = [
        { desc: 'falta username', body: { password: '12345' } },
        { desc: 'falta password', body: { username: 'Alice' } }
    ];

    camposTestLogin.forEach(({ desc, body }) => {
        it(`debería devolver 400 si ${desc}`, async () => {
            const res = await request(app).post('/login').send(body);
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Todos los campos son obligatorios');
        });
    });

    // --- CASO 2: USUARIO NO ENCONTRADO ---
    it('debería fallar si el usuario no existe (401)', async () => {
        vi.spyOn(User, 'findOne').mockResolvedValueOnce(null);

        const res = await request(app)
            .post('/login')
            .send({ 
                username: 'NoExiste', 
                password: '12345'
            });

        expect(res.status).toBe(401);
        expect(res.body.error).toBe('Usuario o contraseña incorrectos');
    });

    // --- CASO 3: ERROR INTERNO ---
    it('debería devolver 500 si la base de datos falla', async () => {
        vi.spyOn(User, 'findOne').mockRejectedValueOnce(new Error('Fallo crítico de conexión'));

        const res = await request(app)
            .post('/login')
            .send({ 
                username: 'Alice', 
                password: '12345'
            });

        expect(res.status).toBe(500);
        expect(res.body.error).toBe('Error interno del servidor');
    });


    // --- CASO 4: LOGIN FALLIDO POR CONTRASEÑA INCORRECTA ---
    it('debería fallar si contraseña es incorrecta', async () => {
        const mockUser = {
            _id: { toString: () => 'user123' },
            username: 'Alice',
            password: 'hashedPassword'
        };

        vi.spyOn(User, 'findOne').mockResolvedValueOnce(mockUser);

        // Mockear bcrypt.compare para devolver false
        vi.mocked(bcryptjs.compare).mockResolvedValueOnce(false);

        const res = await request(app)
            .post('/login')
            .send({ 
                username: 'Alice', 
                password: 'wrongpassword'
            });

        expect(res.status).toBe(401);
        expect(res.body.error).toBe('Usuario o contraseña incorrectos');
    });
});

describe('CORS y Middleware', () => {
    
    // --- Test para OPTIONS request ---
    it('debería manejar OPTIONS request correctamente', async () => {
        const res = await request(app).options('/login');
        
        expect(res.status).toBe(204);
        expect(res.headers['access-control-allow-origin']).toBe('*');
        expect(res.headers['access-control-allow-methods']).toContain('GET');
    });

    // --- Test para verificar headers CORS en POST ---
    it('debería incluir headers CORS en respuesta POST', async () => {
        vi.spyOn(User, 'findOne').mockResolvedValueOnce(null);

        const res = await request(app)
            .post('/login')
            .send({ 
                username: 'test', 
                password: '123'
            });

        expect(res.headers['access-control-allow-origin']).toBe('*');
        expect(res.headers['access-control-allow-methods']).toContain('GET');
    });

    // --- Test para verificar headers CORS en GET ---
    it('debería incluir headers CORS en respuesta GET', async () => {
        vi.spyOn(User, 'findOne').mockResolvedValueOnce(null);

        const res = await request(app)
            .get('/getuserstats/testuser');

        expect(res.headers['access-control-allow-origin']).toBe('*');
    });
});