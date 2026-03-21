/**
 * routes/stats.js
 * 
 * Rutas para gestionar estadísticas de usuarios
 * GET  /getuserstats/:username - Obtener estadísticas del usuario
 * POST /updateuserstats       - Actualizar estadísticas después de una partida (SOLO si se ha finalizado)
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * GET /getuserstats/:username
 * Obtiene las estadísticas de un usuario
 */
router.get('/getuserstats/:username', async (req, res) => {
    try {
        const { username } = req.params;

        // Sanitizar username
        const sanitizedUsername = String(username || '')
            .trim()
            .replace(/[^\w\s@.-]/gi, '');

        // Buscar usuario
        const user = await User.findOne({ username: sanitizedUsername });

        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({
            username: user.username,
            totalGames: user.totalGames,
            gamesWon: user.gamesWon,
            gamesLost: user.gamesLost
        });

    } catch (err) {
        console.error("Error en GET /getuserstats:", err);
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
router.post('/updateuserstats', async (req, res) => {
    try {
        const { username, won, score } = req.body;

        // Validación básica
        if (!username || won === undefined) {
            return res.status(400).json({ error: "Username y won son requeridos" });
        }

        // Sanitizar username
        const sanitizedUsername = String(username || '')
            .trim()
            .replace(/[^\w\s@.-]/gi, '');

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

module.exports = router;
