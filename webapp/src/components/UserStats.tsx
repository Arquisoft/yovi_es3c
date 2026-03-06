import React from "react";

/**
 * Componente UserStats - Muestra las estadísticas del usuario en tarjetas coloridas
 * 
 * Este componente renderiza 4 tarjetas:
 * - Nombre del usuario (tarjeta neutra azul)
 * - Partidas ganadas (tarjeta verde) 
 * - Partidas perdidas (tarjeta roja)
 * - Porcentaje de victorias (tarjeta neutra)
 * 
 * Las tarjetas usan colores diferentes según su tipo (ganadas/perdidas/neutral)
 * y cada una tiene un icono emoji para hacerlo más visual
 */
export const UserStats: React.FC = () => {
    // Datos ficticios del usuario (cuando tengas Backend, cambiarás esto)
    const stats = {
        username: "Juan",
        totalPartidas: 17,
        ganadasCount: 12,
        perdidasCount: 5
    };

    return (
        <div className="user-stats">
            {/* FILA SUPERIOR: Usuario + Partidas totales */}
            {/* Tarjeta neutra con el nombre del usuario */}
            <div className="stat-card neutral">
                <div className="stat-icon">👤</div>
                <div className="stat-label">Usuario</div>
                <div className="stat-value">{stats.username}</div>
            </div>

            {/* Tarjeta neutra con partidas totales */}
            <div className="stat-card neutral">
                <div className="stat-icon">🎮</div>
                <div className="stat-label">Total Partidas</div>
                <div className="stat-value">{stats.totalPartidas}</div>
            </div>

            {/* FILA INFERIOR: Ganadas (izq) + Perdidas (der) */}
            {/* Tarjeta verde para partidas ganadas */}
            <div className="stat-card win">
                <div className="stat-icon">✅</div>
                <div className="stat-label">Ganadas</div>
                <div className="stat-value">{stats.ganadasCount}</div>
            </div>

            {/* Tarjeta roja para partidas perdidas */}
            <div className="stat-card loss">
                <div className="stat-icon">❌</div>
                <div className="stat-label">Perdidas</div>
                <div className="stat-value">{stats.perdidasCount}</div>
            </div>
        </div>
    );
};