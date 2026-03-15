/**
 * gameService.ts
 * 
 * Servicio para interactuar con la API del backend
 * Funciones para actualizar y obtener estadísticas del usuario
 */

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';


/**
 * Obtener estadísticas del usuario
 * @param username - Nombre del usuario
 * @returns Objeto con estadísticas (totalGames, gamesWon, gamesLost, winPercentage)
 */


export const getUserStats = async (username: string) => {
    try {
        const response = await fetch(`${API_URL}/getuserstats/${username}`);


        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error obteniendo estadísticas del usuario:', error);
        throw error;
    }
};

/**
 * Actualizar estadísticas del usuario cuando termina una partida
 * @param username - Nombre del usuario
 * @param won - Si el usuario ganó (true) o perdió (false)
 * @returns Objeto con estadísticas actualizadas
 */
export const updateUserStats = async (username: string, won: boolean) => {
    try {
        const response = await fetch(`${API_URL}/updateuserstats`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, won })
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error actualizando estadísticas:', error);
        throw error;
    }
};
