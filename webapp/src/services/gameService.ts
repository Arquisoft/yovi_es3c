/**
 * gameService.ts
 * 
 * Servicio para interactuar con la API del backend
 * Funciones para actualizar y obtener estadísticas del usuario
 */

import { httpClient } from '../utils/httpClient';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';


/**
 * Obtener estadísticas del usuario
 * @param username - Nombre del usuario
 * @returns Objeto con estadísticas (totalGames, gamesWon, gamesLost, winPercentage, score)
 */
export const getUserStats = async (username: string) => {
    try {
        const response = await httpClient(`${API_URL}/getuserstats/${username}`);

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error obteniendo estadísticas del usuario:', error);
        throw error;
    }
};


export const getUserScore = async (username: string) => {
    try{

        const response = await httpClient(`${API_URL}/getuserscore/${username}`);

        if(!response.ok)
            throw new Error(`Error ${response.status}: ${response.statusText}`);

        return await response.json();

    }catch(error) {
        console.error('Error obteniendo la puntuación del usuario:', error);
        throw error;
    }
};

/**
 * Actualizar estadísticas del usuario cuando termina una partida
 * @param username - Nombre del usuario
 * @param won - Si el usuario ganó (true) o perdió (false)
 * @param score - La puntuación del usuario
 * @returns Objeto con estadísticas actualizadas
 */
export const updateUserStats = async (username: string, won: boolean, score: number) => {
    try {
        const response = await httpClient(`${API_URL}/updateuserstats`, {
            method: 'POST',
            body: JSON.stringify({ username, won, score })
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
