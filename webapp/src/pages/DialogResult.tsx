import './Dialog.css';

interface RankingEntry {
    position: number;
    name: string;
    score: string;
}

interface DialogResultProps {
    loggedIn: boolean;
    won: boolean;
    newRecord: boolean;
    onPlayAgain: () => void;
    onGoHome: () => void;

    gameInfo: {
        movesMade: number;
        duration: string;
        score: number;
    };

    ranking: RankingEntry[];
}

const RANKING_BADGES: Record<number, string> = {
    1: '🥇' ,
    2: '🥈',
    3: '🥉',
};

const DEFAULT_RANKING: RankingEntry[] = [
    { position: 1, name: 'Jugador1', score: '-' },
    { position: 2, name: 'Jugador2', score: '-' },
    { position: 3, name: 'Jugador3', score: '-' },
];

const DialogResult = ({
  loggedIn,
  won,
  newRecord,
  onPlayAgain,
  onGoHome,
  gameInfo,
  ranking = DEFAULT_RANKING,
}: DialogResultProps) => {
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
            {ranking.map((entry) => (
              <div
                key={entry.position}
                className={`game-dialog__ranking-item game-dialog__ranking-item--${entry.position}`}
              >
                <span className="game-dialog__ranking-badge">
                  {RANKING_BADGES[entry.position] ?? `#${entry.position}`}
                </span>
                <span>{entry.name}</span>
              </div>
            ))}
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