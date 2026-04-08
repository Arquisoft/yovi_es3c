import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import app from '../users-service.js'
import User from '../models/User.js'

describe('GET /getuserstats/:username', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // --- CASO 1: OBTENER ESTADÍSTICAS CORRECTAMENTE ---
    it('debería obtener las estadísticas del usuario correctamente (200)', async () => {
        const mockUser = {
            username: 'Alice',
            totalGames: 10,
            gamesWon: 7,
            gamesLost: 3
        };

        vi.spyOn(User, 'findOne').mockResolvedValueOnce(mockUser);

        const res = await request(app)
            .get('/getuserstats/Alice');

        expect(res.status).toBe(200);
        expect(res.body.username).toBe('Alice');
        expect(res.body.totalGames).toBe(10);
        expect(res.body.gamesWon).toBe(7);
        expect(res.body.gamesLost).toBe(3);
    });

    // --- CASO 2: USUARIO NO ENCONTRADO ---
    it('debería devolver 404 si el usuario no existe', async () => {
        vi.spyOn(User, 'findOne').mockResolvedValueOnce(null);

        const res = await request(app)
            .get('/getuserstats/NoExiste');

        expect(res.status).toBe(404);
        expect(res.body.error).toBe('Usuario no encontrado');
    });

    // --- CASO 3: ERROR INTERNO ---
    it('debería devolver 500 si la base de datos falla inesperadamente', async () => {
        vi.spyOn(User, 'findOne').mockRejectedValueOnce(new Error('Fallo crítico de conexión'));

        const res = await request(app)
            .get('/getuserstats/Alice');

        expect(res.status).toBe(500);
        expect(res.body.error).toBe('Error interno del servidor');
    });
});

describe('POST /updateuserstats', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // --- CASO 1: ACTUALIZAR ESTADÍSTICAS - VICTORIA ---
    it('debería actualizar estadísticas correctamente cuando ganó (200)', async () => {
        const mockUser = {
            username: 'Alice',
            totalGames: 5,
            gamesWon: 3,
            gamesLost: 2,
            save: vi.fn().mockResolvedValue({})
        };

        vi.spyOn(User, 'findOne').mockResolvedValueOnce(mockUser);

        const res = await request(app)
            .post('/updateuserstats')
            .send({ 
                username: 'Alice',
                won: true
            });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Estadísticas actualizadas');
        expect(res.body.username).toBe('Alice');
        expect(res.body.totalGames).toBe(6);
        expect(res.body.gamesWon).toBe(4);
    });

    // --- CASO 2: ACTUALIZAR ESTADÍSTICAS - DERROTA ---
    it('debería actualizar estadísticas correctamente cuando perdió (200)', async () => {
        const mockUser = {
            username: 'Bob',
            totalGames: 3,
            gamesWon: 2,
            gamesLost: 1,
            save: vi.fn().mockResolvedValue({})
        };

        vi.spyOn(User, 'findOne').mockResolvedValueOnce(mockUser);

        const res = await request(app)
            .post('/updateuserstats')
            .send({ 
                username: 'Bob',
                won: false
            });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Estadísticas actualizadas');
        expect(res.body.totalGames).toBe(4);
        expect(res.body.gamesLost).toBe(2);
    });

    // --- CASO 3: CAMPOS FALTANTES ---
    const camposTestStats = [
        { desc: 'falta username', body: { won: true } },
        { desc: 'falta won', body: { username: 'Alice' } },
        { desc: 'won es undefined', body: { username: 'Alice', won: undefined } }
    ];

    camposTestStats.forEach(({ desc, body }) => {
        it(`debería devolver 400 si ${desc}`, async () => {
            const res = await request(app).post('/updateuserstats').send(body);
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Username y won son requeridos');
        });
    });

    // --- CASO 4: USUARIO NO ENCONTRADO ---
    it('debería devolver 404 si el usuario no existe', async () => {
        vi.spyOn(User, 'findOne').mockResolvedValueOnce(null);

        const res = await request(app)
            .post('/updateuserstats')
            .send({ 
                username: 'NoExiste',
                won: true
            });

        expect(res.status).toBe(404);
        expect(res.body.error).toBe('Usuario no encontrado');
    });

    // --- CASO 5: ERROR AL BUSCAR USUARIO ---
    it('debería devolver 500 si la base de datos falla al buscar usuario', async () => {
        vi.spyOn(User, 'findOne').mockRejectedValueOnce(new Error('Fallo crítico de conexión'));

        const res = await request(app)
            .post('/updateuserstats')
            .send({ 
                username: 'Alice',
                won: true
            });

        expect(res.status).toBe(500);
        expect(res.body.error).toBe('Error interno del servidor');
    });
});
