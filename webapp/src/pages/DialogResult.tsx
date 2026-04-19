import './Dialog.css';
import {useEffect, useState} from 'react';
import { getGlobalRanking } from '../services/rankingService';
import type { PlayerStats } from '../services/rankingService';

export interface DialogResultProps {
    loggedIn: boolean;
    won: boolean;
    newRecord: boolean;
    onPlayAgain: () => void;
    onGoHome: () => void;
    user?: {username: string } | null;

    gameInfo: {
        movesMade: number;
        duration: string;
        score: number;
    };
}

const RANKING_BADGES: Record<number, string> = {
    1: '🥇' ,
    2: '🥈',
    3: '🥉',
};

const DialogResult = ({
  loggedIn,
  won,
  newRecord,
  onPlayAgain,
  onGoHome,
  gameInfo,
  user,
}: DialogResultProps) => {
  const[top3, setTop3] = useState<PlayerStats[]>([]);
  const[rankingLoading, setRankingLoading] = useState<boolean>(true);
  const[rankingError, setRankingError] = useState<string>('');

  useEffect(() => {
    if (!loggedIn) {
      setRankingLoading(false);
      setRankingError('Inicia sesión para ver el ranking');
      return;
    }

    getGlobalRanking()
          .then((players) => {
            const sorted = [...players].sort((a,b) => b.score - a.score);
            setTop3(sorted.slice(0, 3));
          })
          .catch(() => setRankingError('Error al cargar el ranking.'))
          .finally(() => setRankingLoading(false));
  }, [loggedIn]);
  
  return (
    <>
      {/* ── Cabecera ── */}
      <div className="game-dialog__header">
        <h2 className={`game-dialog__title ${won ? 'game-dialog__title--win' : 'game-dialog__title--loss'}`}>
          {won ? '¡Has ganado!' : '¡Has perdido!'}
        </h2>
      </div>

      {/* ── Cuerpo ── */}
      <div className="game-dialog__body">
        {/* Columna izquierda: info de la partida */}
        <div className="game-dialog__info">
          <p className="game-dialog__info-section-title">Info de la partida</p>

          <div className="game-dialog__info-row">
            <span className="game-dialog__info-label">Duración</span>
            <span className="game-dialog__info-value">{gameInfo.duration ?? '—'}</span>
          </div>

          <div className="game-dialog__info-row">
            <span className="game-dialog__info-label">Movimientos</span>
            <span className="game-dialog__info-value">{gameInfo.movesMade ?? '—'}</span>
          </div>

          <div className="game-dialog__info-row">
            <span className="game-dialog__info-label">Puntuación</span>
            <span className="game-dialog__info-value">{gameInfo.score ?? '—'}</span>
          </div>
          {}
          {newRecord && (<p className="game-dialog__info-label">¡NUEVO RECORD PERSONAL!</p>)}
          {!loggedIn && (<p className="game-dialog__info-label">Inicia sesión para guardar tu puntuación</p>)}
        </div>

        {/* Columna derecha: ranking */}
        <div className="game-dialog__ranking">
          <p className="game-dialog__ranking-title">Ranking</p>
          <div className="game-dialog__ranking-list">
            {rankingLoading && (
              <p className="game-dialog__ranking-loading">Cargando...</p>
            )}
            {rankingError && (
              <p className="game-dialog__ranking-error">{rankingError}</p>
            )}
            {!rankingLoading && !rankingError && top3.map((player, index) => {
              const position = index + 1;
              return (
                <div
                  key={player._id}
                  className={`game-dialog__ranking-item game-dialog__ranking-item--${position}`}
                >
                  <span className="game-dialog__ranking-badge">
                    {RANKING_BADGES[position] ?? `#${position}`}
                  </span> 
                  <span className="game-dialog__ranking-name">
                    {user && user.username === player.username && '✪ '}
                    {player.username}
                  </span>
                  <span className="game-dialog__ranking-score">{player.score}</span> 
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="game-dialog__footer">
        <button className="game-dialog__btn game-dialog__btn--primary" onClick={onPlayAgain}>
          Jugar de nuevo
        </button>
        <button className="game-dialog__btn game-dialog__btn--secondary" onClick={onGoHome}>
          Volver al inicio
        </button>
      </div>
    </>
  );
};

export default DialogResult;