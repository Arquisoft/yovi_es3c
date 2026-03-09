import React from "react";
import StatCard from "./StatCard";
import '../pages-styles/Dashboard.css';

export const UserStats: React.FC = () => {
    const stats = {
        username: "Álvaro",
        totalPartidas: 17,
        ganadasCount: 12,
        perdidasCount: 5
    };

    return (
        <div>
            <h2 className="user-stats-title">Estadísticas globales</h2>
            <div className="user-stats-grid">
                <StatCard label="Usuario" value={stats.username} type="neutral" />
                <StatCard label="Total Partidas" value={stats.totalPartidas} type="partidas" />
                <StatCard label="Ganadas partidas" value={stats.ganadasCount} type="win" />
                <StatCard label="Perdidas partidas" value={stats.perdidasCount} type="loss" />
            </div>
        </div>
    );
};