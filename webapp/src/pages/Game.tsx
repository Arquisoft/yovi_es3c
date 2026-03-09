import {useState} from 'react';
import GameBoard from './gui/GameBoard';
import './Game.css';

export function Game() {

    const size = 7;
    const GAMEY_API_URL = import.meta.env.VITE_GAMEY_API_URL ?? 'http://localhost:4000';

    const [textoTurno, setTextoTurno] = useState<String>("Es tu turno");

  return (
    <div className="game-container">
      <header className="game-header">
        <h1>Game Y</h1>
        <p>{textoTurno}</p>
      </header>
      
      <main className="game-main">
        <GameBoard 
          size={size} 
          botId="random_bot"
        />
      </main>

    </div>
  );
}

export default Game;
