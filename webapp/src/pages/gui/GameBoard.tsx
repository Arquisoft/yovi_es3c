import { useState } from 'react';
import GameSquare from './GameSquare';
import { coordToRowCol, createInitialLayout, updateLayoutPosition, getLayoutState } from './boardUtils';

interface GameBoardProps {
  size?: number;
  squareSize?: number;
  layout?: string;
  botId?: string;
  setTextoTurno: (text: string) => void;
  gameOver: boolean;
  onGameOver: (winner: number) => void;
}

function GameBoard(
  { 
    size = 15, 
    squareSize = 50, 
    layout, 
    botId = 'random_bot', 
    setTextoTurno,
    gameOver, 
    onGameOver 
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
    
    // Validar si el jugador ha ganado
    if (await hasGameFinished(newLayout)) {
      return;
    }
    
    // Llamar al bot
    setIsWaiting(true);
    setTextoTurno("Es el turno del Bot");
    try {
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

        // Simular que el bot tarda 1 segundo en decidir
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Actualizar con el movimiento del bot
        const { row: botRow, col: botCol } = coordToRowCol(botResponse.coords.x, botResponse.coords.y, size);
        const finalLayout = updateLayoutPosition(newLayout, botRow, botCol, 'R');
        setBoardLayout(finalLayout);
        
        // Validar si el bot ha ganado
        await hasGameFinished(finalLayout);
      }
    } catch (error) {
      console.error('Error calling bot:', error);
    } finally {
      setIsWaiting(false);
      setTextoTurno("Es tu turno");
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
          size={squareSize}
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
        style={{
          display: "flex",
          gap: "4px",
          marginLeft: `${(size - (row + 1)) * (squareSize / 2) + row}px`,
          marginTop: "-11px"
        }}
      >
        {elements}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>
      {rows}
    </div>
  );
}

export default GameBoard;
