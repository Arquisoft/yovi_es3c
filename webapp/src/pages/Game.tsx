import { useRef, useState, useCallback } from 'react';
import GameBoard, { type GameBoardHandle } from './gui/GameBoard';
import TurnTimer from './gui/TurnTimer';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateUserStats } from '../services/gameService';
import { getUserScore } from '../services/gameService';
import { BOTS, getTimeLimitForBot } from '../config/botsConfig';
import './Game.css';
import CollapsibleDialog from './CollapsibleDialog';
import {useNavigate} from 'react-router-dom';

function Game() {
  let loggedIn = false;
  const startTime = useRef<number>(new Date().getTime());
  let elapsedTime = 0;
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { size, botId } = location.state || { size: 12, botId: "heuristic_bot" };
  // useRef es un hook que sirve para mantener referencia a un componente y poder llamar a sus métodos.
  const gameBoardRef = useRef<GameBoardHandle>(null);

  const [playerScore, setPlayerScore] = useState(10000);
  const [gameOver, setGameOver] = useState(false);
  const [dialogContent, setDialogContent] = useState<React.ReactNode>(null);
  const [moveCount, setMoveCount] = useState(0);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [turnTimeLimit] = useState(getTimeLimitForBot(botId));

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

    if(userScore && userScore.score < finalScore)
      newRecord = true;

    setDialogContent(

      <CollapsibleDialog 
        loggedIn = {loggedIn}
        won={winnerId === 0}
        newRecord = {newRecord}
        gameInfo = {{
          duration: timeFormat(elapsedTime),
          movesMade: moveCount,
          score: finalScore
        }}

        onPlayAgain={() => {
          window.location.reload();
        }}
        onGoHome={() =>{
          navigate('/dashboard');
        }}
        />
    );
   
  }

  const displayBotName = BOTS[botId] || botId;

  const handlePlayerTimeUp = useCallback(() => {
    gameBoardRef.current?.skipPlayerTurn();
  }, []);

  const handleBotTimeUp = useCallback(() => {
    setIsPlayerTurn(true);
  }, []);

  return (
    <div className="game-container">

      {dialogContent}
      <div className="game-content">

        <aside className='game-aside'>
          <TurnTimer
            timeLimit={turnTimeLimit}
            isActive={isPlayerTurn && !gameOver}
            onTimeUp={handlePlayerTimeUp}
            label={isPlayerTurn? "Tu turno" : undefined}
            type="player"
          />
          <div className="player-info">
            <h3>{user?.username || "Invitado"}</h3>
            <p>Puntuación: {playerScore}</p>
            <p>Movimientos: {moveCount}</p>
          </div>
        </aside>

        <main className="game-main">
          <GameBoard
            ref={gameBoardRef}
            size={size}
            botId={botId}
            gameOver={gameOver}
            onGameOver={handleGameOver}
            onMoveMade={() => {
              let timeMoveMadeAt = new Date().getTime();
              calculateScoreOnMove(timeMoveMadeAt-startTime.current);
              setMoveCount(prev => prev + 1);
            }}
            onTurnChange={setIsPlayerTurn}
          />
        </main>

        <aside className="game-aside">
          <TurnTimer
            timeLimit={turnTimeLimit}
            isActive={!isPlayerTurn && !gameOver}
            onTimeUp={handleBotTimeUp}
            label={!isPlayerTurn? "Turno del Bot" : undefined}
            type="bot"
          />
          <div className="bot-info">
            <h3>Bot</h3>
            <p>{displayBotName}</p>
          </div>
        </aside>

      </div>
    </div>
  );
}

export default Game;
