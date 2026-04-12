import React from "react";
import StatCard from "./StatCard";
import '../pages/Dashboard.css';

interface UserStatsProps {
    stats?: {
        username: string;
        totalGames: number;
        gamesWon: number;
        gamesLost: number;
    };
}

/**
 * Componente UserStats - Muestra las estadísticas del usuario en tarjetas
 * 
 * Si recibe stats como prop, muestra las estadísticas reales desde MongoDB
 * Si no, muestra datos por defecto (para compatibilidad)
 * 
 * Las estadísticas se pasan a través de componentes StatCard
 */
export const UserStats: React.FC<UserStatsProps> = ({ stats }) => {
    // Datos por defecto si no se pasan stats
    const displayStats = stats || {
        username: "Álvaro",
        totalGames: 17,
        gamesWon: 12,
        gamesLost: 5
    };

    return (
        <div>
            <h2 className="user-stats-title">Estadísticas globales</h2>
            <div className="user-stats-grid">
                <StatCard label="Usuario" value={displayStats.username} type="neutral" />
                <StatCard label="Total Partidas" value={displayStats.totalGames} type="partidas" />
                <StatCard label="Ganadas partidas" value={displayStats.gamesWon} type="win" />
                <StatCard label="Perdidas partidas" value={displayStats.gamesLost} type="loss" />
            </div>
        </div>
    );
};