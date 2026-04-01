import { useRef, useState } from 'react';
import GameBoard from './gui/GameBoard';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateUserStats } from '../services/gameService';
import { getUserScore } from '../services/gameService';
import { BOTS } from '../config/botsConfig';
import './Game.css';
import DialogResult from './DialogResult';
import {useNavigate} from 'react-router-dom';

function Game() {
  let loggedIn = false;
  const startTime = useRef<number>(new Date().getTime());
  let elapsedTime = 0;
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { size, botId } = location.state || { size: 12, botId: "heuristic_bot" };

  const [playerScore, setPlayerScore] = useState(10000);
  const [textoTurno, setTextoTurno] = useState<String>("Es tu turno");
  const [gameOver, setGameOver] = useState(false);
  const [dialogContent, setDialogContent] = useState<React.ReactNode>(null);
  const [moveCount, setMoveCount] = useState(1);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Devuelve el tiempo de la partida en un formato mm:ss
  const timeFormat = (ms: number): string => {
    let totalSeconds = Math.floor(ms / 1000);
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Calcula la puntuación de la partida con cada movimiento
  const calculateScoreOnMove = (elapsedTime: number): void => {
    const timePenalty = Math.floor(elapsedTime / 1000) * 5; // -5 puntos por cada segundo
    setPlayerScore(playerScore - timePenalty);
  };

  const handleGameOver = async (winnerId: number) => {

    setGameOver(true);
    let endTime = new Date().getTime();

    elapsedTime = endTime - startTime.current;

    const finalScore = winnerId !== 0 ? moveCount * 10 : playerScore;

    setPlayerScore(finalScore);
    // Habilitar el dialogo con el resumen de la partida
    toggleDialog(winnerId, finalScore);

    // Actualizar estadísticas si el usuario está autenticado
    if (user && user.username) {
      try {
        const won = winnerId === 0; // true si el usuario ganó
        await updateUserStats(user.username, won, finalScore);
        console.log("Estadísticas actualizadas");
      } catch (error) {
        console.error("Error al actualizar estadísticas:", error);
      }
    }
  };
  
  // Crea el dialogo con la información de la partida
  const toggleDialog = async (winnerId:number, finalScore:number) => {
    
    let newRecord = false;
    let userScore = null;

    if (user && user.username) {
      try{
        loggedIn = true;
        userScore = await getUserScore(user.username);
      }catch(error){
        console.error("Error al obtener la puntuación:", error);
      }
    }

    console.log(userScore);

    if(userScore.score < finalScore)
      newRecord = true;

    setDialogContent(

      <DialogResult 
        loggedIn = {loggedIn}
        won={winnerId === 0}
        newRecord = {newRecord}
        gameInfo = {{
          duration: timeFormat(elapsedTime),
          movesMade: moveCount,
          score: finalScore
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
      </div>

      <dialog ref={dialogRef} className="game-dialog-overlay">{dialogContent}</dialog>

      <div className="game-content">

        <aside className="player-panel">
          <h3>{user?.username || "Invitado"}</h3>
          <p>Puntuación: {playerScore}</p>
          <p>Movimientos: {moveCount}</p>
        </aside>

        <main className="game-main">
          <GameBoard
            size={size}
            botId={botId}
            setTextoTurno={setTextoTurno}
            gameOver={gameOver}
            onGameOver={handleGameOver}
            onMoveMade={() => {
              let timeMoveMadeAt = new Date().getTime();
              calculateScoreOnMove(timeMoveMadeAt-startTime.current);
              setMoveCount(prev => prev + 1);
            }}
          />
        </main>

        <aside className="bot-panel">
          <h3>Bot</h3>
          <p>{displayBotName}</p>
        </aside>

      </div>
    </div>
  );
}

export default Game;
