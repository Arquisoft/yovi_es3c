/**
 * Configuración de bots
 */

// Mapeo: bot ID → nombre para mostrar
export const BOTS: Record<string, string> = {
    random_bot: "Aleatorio",
    heuristic_bot: "Heurístico",
    defensive_bot: "Defensivo",
    montecarlo_bot: "Montecarlo",
    shortest_path_bot: "Dijkstra"
};

// Dificultad de los bots
export const DIFICULTAD_A_BOTS: Record<string, string[]> = {
    facil: ["random_bot"],
    media: ["heuristic_bot", "defensive_bot"],
    dificil: ["montecarlo_bot", "shortest_path_bot"]
};

