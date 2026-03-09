import GameBoard from './gui/GameBoard';
import './Game.css';

export function Game() {

    const play = (x: number, y: number, z: number) => {
      alert(`Play called for position: x=${x}, y=${y}, z=${z}`);
      // Aquí irá la llamada a la API posteriormente
    };

  return (
    <div className="game-container">
      <header className="game-header">
        <h1>Game Y</h1>
      </header>
      
      <main className="game-main">
        <GameBoard size={4} onPlay={play} />
      </main>
        
    </div>
  );
}

export default Game;
