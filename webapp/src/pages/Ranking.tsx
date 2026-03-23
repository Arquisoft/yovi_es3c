import React, { useEffect, useState } from 'react';
import { getGlobalRanking } from '../services/rankingService';
import type { PlayerStats } from '../services/rankingService';

export const Ranking: React.FC = () => {
    const [players, setPlayers] = useState<PlayerStats[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        getGlobalRanking()
            .then(setPlayers)
            .catch(() => setError('Error al cargar el ranking'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p className="ranking-status">Cargando ranking...</p>;
    if (error) return <p className="ranking-status error">{error}</p>;
    
    return (
        <div className="ranking-container">
            Ranking global
            <table className="ranking-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Jugador</th>
                        <th>Partidas</th>
                        <th>Victorias</th>
                        <th>Derrotas</th>
                        <th>% Victoria</th>
                    </tr>
                </thead>
                <tbody>
                    {players.map((player,index) => (
                        <tr key={player._id}>
                            <td>{index + 1}</td>
                            <td>{player.username}</td>
                            <td>{player.totalGames}</td>
                            <td>{player.gamesWon}</td>
                            <td>{player.gamesLost}</td>
                            <td>
                                {player.totalGames > 0
                                ? ((player.gamesWon / player.totalGames) * 100).toFixed(1) + '%'
                                : '-'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default Ranking;