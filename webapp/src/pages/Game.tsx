import { useRef, useState } from 'react';
import GameBoard from './gui/GameBoard';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateUserStats } from '../services/gameService';
import { BOTS } from '../config/botsConfig';
import './Game.css';
import DialogResult from './DialogResult';
import {useNavigate} from 'react-router-dom';

function Game() {
  var loggedIn = false;
  const startTime = useRef<number>(new Date().getTime());
  var elapsedTime = 0;
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { size, botId } = location.state || { size: 12, botId: "heuristicbot" };

  const [textoTurno, setTextoTurno] = useState<String>("Es tu turno");
  const [gameOver, setGameOver] = useState(false);
  const [dialogContent, setDialogContent] = useState<React.ReactNode>(null);
  const [moveCount, setMoveCount] = useState(1);
  
  // Devuelve el tiempo de la partida en un formato mm:ss
  const timeFormat = (ms: number): string => {
    var totalSeconds = Math.floor(ms / 1000);
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  const calculateScore = (elapsedTime: number, moveCount:number): number => {
    const baseScore = 10000;
    const timePenalty = Math.floor(elapsedTime / 1000) * 10; // -10 puntos por cada segundo
    const movePenalty = moveCount * 50; // - 50 puntos por cada movimiento hecho
    
    return Math.max(0, baseScore - timePenalty - movePenalty);
  };

  const handleGameOver = async (winnerId: number) => {
    setGameOver(true);
    var endTime = new Date().getTime();

    elapsedTime = endTime - startTime.current;

    var score = calculateScore(elapsedTime, moveCount);

    toggleDialog(winnerId, score);
    const winnerName = winnerId === 0 ? '¡Tú ganas!' : '¡El bot gana!';
    setTextoTurno(winnerName);

    // Actualizar estadísticas si el usuario está autenticado
    if (user && user.username) {
      try {
        const won = winnerId === 0; // true si el usuario ganó
        await updateUserStats(user.username, won, score);
        console.log("Estadísticas actualizadas");
      } catch (error) {
        console.error("Error al actualizar estadísticas:", error);
      }
    }
  };

  const dialogRef = useRef<HTMLDialogElement>(null);

  function toggleDialog(winnerId:number, playerScore:number){
    
    if(user && user.username)
      loggedIn = true;

    setDialogContent(

      <DialogResult 
        loggedIn = {loggedIn}
        won={winnerId === 0}
        gameInfo = {{
          duration: timeFormat(elapsedTime),
          movesMade: moveCount,
          score: playerScore
        }}

        ranking={[
          { position: 1, name: 'Alice', score: '120' },
          { position: 2, name: 'Bob',   score: '98'  },
          { position: 3, name: 'Carol', score: '75'  }
        ]}

        onPlayAgain={() => {
          window.location.reload();
        }}
        onGoHome={() =>{
          navigate('/dashboard');
        }}
        />
    );
    
    if(!dialogRef.current){
      return;
    }

    dialogRef.current.hasAttribute("open") 
      ? dialogRef.current.close() 
      : dialogRef.current.showModal();
  }

  const displayBotName = BOTS[botId] || botId;

  return (
    <div className="game-container">
      <div className="game-header">
        <p>{textoTurno}</p>
        <div className='game-info'>
          <p>Bot: {displayBotName}</p>
        </div>
      </div>
      <dialog ref={dialogRef} className="game-dialog-overlay">{dialogContent}</dialog>
      <main className="game-main">
        <GameBoard
          size={size}
          botId={botId}
          setTextoTurno={setTextoTurno}
          gameOver={gameOver}
          onGameOver={handleGameOver}
          onMoveMade={() => setMoveCount(prev => prev + 1)}
        />
      </main>

    </div>
  );
}

export default Game;
