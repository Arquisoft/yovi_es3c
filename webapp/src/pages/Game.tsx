import { useState } from 'react';
import GameBoard from './gui/GameBoard';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateUserStats } from '../services/gameService';
import './Game.css';

function Game() {

  const location = useLocation();
  const { user } = useAuth();
  const { size, botId } = location.state || { size: 12, botId: "heuristicbot" };

  const [textoTurno, setTextoTurno] = useState<String>("Es tu turno");
  const [gameOver, setGameOver] = useState(false);

  const handleGameOver = async (winnerId: number) => {
    setGameOver(true);
    const winnerName = winnerId === 0 ? '¡Tú ganas!' : '¡El bot gana!';
    setTextoTurno(winnerName);

    // Actualizar estadísticas si el usuario está autenticado
    if (user && user.username) {
      try {
        const won = winnerId === 0; // true si el usuario ganó
        await updateUserStats(user.username, won);
        console.log("Estadísticas actualizadas");
      } catch (error) {
        console.error("Error al actualizar estadísticas:", error);
      }
    }
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
