/**
 * Configuración de bots
 */

// Mapeo: bot ID → nombre para mostrar
export const BOTS: Record<string, string> = {
    random_bot: "Aleatorio",
    heuristic_bot: "Heurístico",
    defensive_bot: "Defensivo",
    montecarlo_bot: "Montecarlo"
};

// Dificultad de los bots
export const DIFICULTAD_A_BOTS: Record<string, string[]> = {
    facil: ["random_bot"],
    media: ["heuristic_bot", "defensive_bot"],
    dificil: ["montecarlo_bot"]
};

// Tiempo límite (en segundos) por dificultad
export const DIFFICULTY_TIME_LIMITS: Record<string, number> = {
    facil: 30,
    media: 20,
    dificil: 10
};

// Obtener la dificultad de un bot específico
export const getDifficultyForBot = (botId: string): string => {
    for (const [difficulty, bots] of Object.entries(DIFICULTAD_A_BOTS)) {
        if (bots.includes(botId)) {
            return difficulty;
        }
    }
    return "media"; // dificultad por defecto
};

// Obtener el tiempo límite para un bot específico
export const getTimeLimitForBot = (botId: string): number => {
    const difficulty = getDifficultyForBot(botId);
    return DIFFICULTY_TIME_LIMITS[difficulty] ?? 20; // 20 segundos por defecto
};
