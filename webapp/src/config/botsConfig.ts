/**
 * Configuración de bots
 */

// Mapeo: bot ID → nombre para mostrar
export const BOTS: Record<string, string> = {
    random_bot: "Aleatorio",
    heuristicbot: "Heurístico",
    defensivebot: "Defensivo"
};

// Dificultad de los bots
export const DIFICULTAD_A_BOTS: Record<string, string[]> = {
    facil: ["random_bot"],
    media: ["heuristicbot"],
    dificil: ["defensivebot"]
};

