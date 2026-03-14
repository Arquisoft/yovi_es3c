import {useState} from 'react';
import GameBoard from './gui/GameBoard';
import { useLocation } from 'react-router-dom';
import './Game.css';

function Game() {

    const location = useLocation();
    const { size, botId } = location.state || {size: 12, botId: "heuristicbot"};

    const [textoTurno, setTextoTurno] = useState<String>("Es tu turno");
    const [gameOver, setGameOver] = useState(false);

    const handleGameOver = (winnerId: number) => {
      setGameOver(true);
      const winnerName = winnerId === 0 ? '¡Tú ganas!' : '¡El bot gana!';
      setTextoTurno(winnerName);
    };

  return (
    <div className="game-container">
      <div className="game-header">
        <p>{textoTurno}</p>
        <div className='game-info'>
            <p>Bot: {botId}</p>
        </div>
      </div>
      
      <main className="game-main">
        <GameBoard 
          size={size} 
          botId={botId}
          setTextoTurno={setTextoTurno}
          gameOver={gameOver}
          onGameOver={handleGameOver}
        />
      </main>

    </div>
  );
}

export default Game;
