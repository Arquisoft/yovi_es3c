/**
 * routes/stats.js
 * 
 * Rutas para gestionar estadísticas de usuarios
 * GET  /getuserstats/:username - Obtener estadísticas del usuario
 * GET  /getuserscore/:username - Obtener la puntuación del usuario si la tiene
 * POST /updateuserstats       - Actualizar estadísticas después de una partida (SOLO si se ha finalizado)
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { validateToken } = require('../middleware/auth');

/**
 * GET /getuserstats/:username
 * Obtiene las estadísticas de un usuario
 */
router.get('/getuserstats/:username', validateToken, async (req, res) => {
    try {
        const { username } = req.params;

        // Sanitizar username
        const sanitizedUsername = String(username || '')
            .trim()
            .replaceAll(/[^\w\s@.-]/gi, '');

        // Buscar usuario
        const user = await User.findOne({ username: sanitizedUsername });

        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({
            username: user.username,
            totalGames: user.totalGames,
            gamesWon: user.gamesWon,
            gamesLost: user.gamesLost,
            score: user.score ?? 0
        });

    } catch (err) {
        console.error("Error en GET /getuserstats:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

/** 
 * GET /getuserscore/:username
 * Obtiene la puntuación del usuario
 */
router.get('/getuserscore/:username', validateToken, async (req, res) => {
    try{
        const {username} = req.params;

        // Sanitizar username
        const sanitizedUsername = String(username || '')
            .trim()
            .replaceAll(/[^\w\s@.-]/gi, '');

        // Buscar usuario
        const user = await User.findOne({ username: sanitizedUsername });

        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({
            score: user.score ?? null
        });

    }catch(err){
        console.error("Error en GET /getuserscore:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

/**
 * POST /updateuserstats
 * Actualiza estadísticas después de terminar una partida
 * Body: { username, won }
 *   - username: nombre del usuario
 *   - won: true si ganó, false si perdió
 */
router.post('/updateuserstats', validateToken, async (req, res) => {
    try {
        const { username, won, score } = req.body;

        // Validación básica
        if (!username || won === undefined) {
            return res.status(400).json({ error: "Username y won son requeridos" });
        }

        // Sanitizar username
        const sanitizedUsername = String(username || '')
            .trim()
            .replaceAll(/[^\w\s@.-]/gi, '');

        // Buscar usuario
        const user = await User.findOne({ username: sanitizedUsername });

        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        // Actualizar estadísticas
        user.totalGames += 1;
        if (won) {
            user.gamesWon += 1;
        } else {
            user.gamesLost += 1;
        }

        if(score != undefined && (!user.score || score > user.score)){
            user.score = score;
        }

        await user.save();

        res.json({
            message: "Estadísticas actualizadas",
            username: user.username,
            totalGames: user.totalGames,
            gamesWon: user.gamesWon,
            gamesLost: user.gamesLost,
            score: user.score
        });

    } catch (err) {
        console.error("Error en POST /updateuserstats:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

/**
 * GET /ranking
 * Devuelve los jugadores que han jugado al menos una partida, ordenados por victorias (mayor a menor).
 */
router.get('/ranking', validateToken, async (req, res) => {
    try {
        const players = await User.find(
            {totalGames: {$gt: 0}}, // Jugadores con al menos una partida jugada.
            { password: 0, __v: 0 } // No devolvemos la contraseña.
        ).sort({gamesWon: -1 });

        return res.status(200).json(players ?? []);
    } catch (err) {
        console.error('Error en GET /ranking:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
