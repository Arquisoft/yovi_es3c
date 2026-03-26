import React, { useEffect, useState } from 'react';
import '../pages-styles/Ranking.css';
import { getGlobalRanking } from '../services/rankingService';
import type { PlayerStats } from '../services/rankingService';

type SortKey = 'username' | 'totalGames' | 'gamesWon' | 'gamesLost' | 'percentage';

export const Ranking: React.FC = () => {
    const [players, setPlayers] = useState<PlayerStats[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({
        key: 'gamesWon',
        direction: 'desc',
    })

    useEffect(() => {
        getGlobalRanking()
            .then(setPlayers)
            .catch(() => setError('Error al cargar el ranking'))
            .finally(() => setLoading(false));
    }, []);

    // Filtro para cada columna.

    const handleSort = (key: SortKey) => {
        setSortConfig(prev => 
            prev.key === key 
            ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc'}
            : { key, direction: 'asc'}
        );
    };

    // Flecha al lado de cada índice de columna para saber cómo está ordenada.
    const renderSortArrow = (key: SortKey) => {
        if (sortConfig.key !== key) return '↕';
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    const sortedPlayers = [...players].sort((a, b) => {
        const {key, direction} = sortConfig;
        const dir = direction === 'asc' ? 1 : -1;

        if (key === 'username') {
            return (a.username ?? '').localeCompare(b.username ?? '') * dir;
        }

        if (key === 'percentage') {
          const percA = a.totalGames > 0 ? a.gamesWon / a.totalGames : 0;
          const percB = b.totalGames > 0 ? b.gamesWon / b.totalGames : 0;
          return (percA - percB) * dir;
        }

        return ((a as any)[key] - (b as any)[key]) * dir;
    });
    
    if (loading) return <p className="ranking-status">Cargando ranking...</p>;
    if (error) return <p className="ranking-status error">{error}</p>;
    
    return (
        <div className="ranking-container">
            <h1>Ranking global</h1>
            <table className="ranking-table">
                <thead>
                    <tr>
                        <th className="th-static">#</th>

                        <th onClick={() => handleSort('username')} className="th-sortable">
                          <div className="th-content">
                            <span>Jugador</span>
                            <button type="button" className="sort-button">
                              {renderSortArrow('username')}
                            </button>
                          </div>
                        </th>

                        <th onClick={() => handleSort('totalGames')} className="th-sortable">
                          <div className="th-content">
                            <span>Partidas</span>
                            <button type="button" className="sort-button">
                              {renderSortArrow('totalGames')}
                            </button>
                          </div>
                        </th>

                        <th onClick={() => handleSort('gamesWon')} className="th-sortable">
                          <div className="th-content">
                            <span>Victorias</span>
                            <button type="button" className="sort-button">
                              {renderSortArrow('gamesWon')}
                            </button>
                          </div>
                        </th>

                        <th onClick={() => handleSort('gamesLost')} className="th-sortable">
                          <div className="th-content">
                            <span>Derrotas</span>
                            <button type="button" className="sort-button">
                              {renderSortArrow('gamesLost')}
                            </button>
                          </div>
                        </th>

                        <th onClick={() => handleSort('percentage')} className="th-sortable">
                          <div className="th-content">
                            <span>% Victoria</span>
                            <button type="button" className="sort-button">
                              {renderSortArrow('percentage')}
                            </button>
                          </div>
                        </th>

                    </tr>
                </thead>
                <tbody>
                    {sortedPlayers.map((player,index) => (
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