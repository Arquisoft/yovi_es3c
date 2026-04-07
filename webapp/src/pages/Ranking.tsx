import React, { useEffect, useState } from 'react';
import '../pages-styles/Ranking.css';
import { getGlobalRanking } from '../services/rankingService';
import type { PlayerStats } from '../services/rankingService';
import { useAuth } from '../context/AuthContext';

type SortKey = 'username' | 'totalGames' | 'gamesWon' | 'gamesLost' | 'percentage';

export const Ranking: React.FC = () => {
    const [players, setPlayers] = useState<PlayerStats[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({
        key: 'gamesWon',
        direction: 'desc',
    })
    const { user} = useAuth();

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

    const sortedPlayers = [...players]
        .filter(player => player.totalGames > 0)
        .sort((a, b) => {
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
        <div className="ranking-page">
            <div className="ranking-container">
                <h1>Ranking global</h1>
                <div className="ranking-table-wrapper">
                    <table className="ranking-table">
                        <thead>
                          <tr>
                            <th className="th-static">#</th>

                            {([ 
                              { key: 'username',   label: 'Jugador'   },
                              { key: 'totalGames', label: 'Partidas'  },
                              { key: 'gamesWon',   label: 'Victorias' },
                              { key: 'gamesLost',  label: 'Derrotas'  },
                              { key: 'percentage', label: '% Victoria'},
                            ] as { key: SortKey; label: string }[]).map(({ key, label }) => (
                              <th key={key} onClick={() => handleSort(key)} className="th-sortable">
                                <div className="th-content">
                                  <span>{label}</span>
                                  <button type="button" className={'sort-button' + (sortConfig.key === key ? ' active' : '')}>
                                    {renderSortArrow(key)}
                                  </button>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        
                        <tbody>
                          {sortedPlayers.map((player, index) => (
                            <tr key={player._id}>
                              <td>{index + 1}</td>
                              <td>
                                {user && user.username === player.username && '✪ '}
                                {player.username}
                                </td>
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
            </div>
        </div>
    )
}

export default Ranking;