import { useState } from 'react';
import GameSquare from './GameSquare';
import { coordToRowCol, createInitialLayout, updateLayoutPosition, getLayoutState } from './boardUtils';
import './GameBoard.css';

interface GameBoardProps {
  size?: number;
  layout?: string;
  botId?: string;
  setTextoTurno: (text: string) => void;
  gameOver: boolean;
  onGameOver: (winner: number) => void;
  onMoveMade: () => void;
}

function GameBoard(
  { 
    size = 15, 
    layout, 
    botId = 'random_bot', 
    setTextoTurno,
    gameOver, 
    onGameOver, 
    onMoveMade,
  }: GameBoardProps) 
{
  const initialLayout = layout || createInitialLayout(size);
  const [boardLayout, setBoardLayout] = useState(initialLayout);
  const [isWaiting, setIsWaiting] = useState(false);
  const apiUrl = import.meta.env.VITE_GAMEY_API_URL ?? 'http://localhost:4000';

  // Comprobar si el juego ha acabado
  const hasGameFinished = async (currentLayout: string) : Promise<Boolean> => {
    try {
      const res = await fetch(`${apiUrl}/v1/ybot/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          size: size,
          players: ['B', 'R'],
          turn: 0,
          layout: currentLayout,
        }),
      });

      const statusResponse = await res.json();
      
      if (statusResponse.status === 'finished' && statusResponse.winner !== null) {
        // El juego ha terminado
        onGameOver(statusResponse.winner);
        return true; 
      }
      return false;
    } catch (error) {
      console.error('Error validating game status:', error);
      return false;
    }
  };

  const handlePlayMove = async (row: number, col: number) : Promise<void> => {
    // Evitar clicks mientras el bot está pensando o el juego ha terminado
    if (isWaiting || gameOver) return; 
    
    const currentState = getLayoutState(boardLayout, row, col);
    
    // Solo permitir jugar en casillas vacías
    if (currentState !== '.') return;
    
    // Actualizar con el movimiento del jugador
    const newLayout = updateLayoutPosition(boardLayout, row, col, 'B');
    setBoardLayout(newLayout);
    onMoveMade();

    // Validar si el jugador ha ganado
    if (await hasGameFinished(newLayout)) {
      return;
    }
    
    // Llamar al bot
    setIsWaiting(true);
    setTextoTurno("Es el turno del Bot");
    try {
      const startTime = Date.now();
      const res = await fetch(`${apiUrl}/v1/ybot/choose/${botId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          size: size,
          players: ['B', 'R'],
          turn: 1,
          layout: newLayout,
        }),
      });

      const botResponse = await res.json();
      
      if (botResponse.coords) {
        // Simular que el bot tarda 1 segundo en decidir, pero solo si ya no tardó más
        const elapsedTime = Date.now() - startTime;
        const remainingDelay = Math.max(0, 1000 - elapsedTime);
        
        if (remainingDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingDelay));
        }
        
        // Actualizar con el movimiento del bot
        const { row: botRow, col: botCol } = coordToRowCol(botResponse.coords.x, botResponse.coords.y, size);
        const finalLayout = updateLayoutPosition(newLayout, botRow, botCol, 'R');
        setBoardLayout(finalLayout);

        // Validar si el bot ha ganado
        if (await hasGameFinished(newLayout)) {
          return;
        }

        setTextoTurno("Es tu turno");
      }
    } catch (error) {
      console.error('Error calling bot:', error);
    } finally {
      setIsWaiting(false);
    }
  };

  const rows = [];
  for (let row = 0; row < size; row++) {
    const elements = [];

    for (let col = 0; col < row + 1; col++) {
      const state = getLayoutState(boardLayout, row, col);
      
      elements.push(
        <GameSquare
          key={`${row}-${col}`}
          row={row}
          col={col}
          state={state}
          onClick={handlePlayMove}
          disabled={isWaiting || gameOver}
        />
      );
    }

    rows.push(
      <div
        key={row}
        className="game-board-row"
      >
        {elements}
      </div>
    );
  }

  return (
    <div className="game-board">
      {rows}
    </div>
  );
}

export default GameBoard;
