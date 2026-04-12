/**
 * rankingService.ts
 * 
 * Servicio para obtener el ranking global de jugadores.
 */

import { httpClient } from '../utils/httpClient';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export interface PlayerStats {
    _id: string;
    username: string;
    totalGames: number;
    gamesWon: number;
    gamesLost: number;
    score: number;
}

export const getGlobalRanking = async (): Promise<PlayerStats[]> => {
    try {
        const response = await httpClient(`${API_URL}/ranking`);

        if (!response.ok){
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
      console.error('Error obteniendo el ranking global:', error);
      throw error;
    }
};