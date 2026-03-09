import { useState } from 'react';
import GameSquare from './GameSquare';
import { coordToRowCol, createInitialLayout, updateLayoutPosition, getLayoutState } from './boardUtils';

interface GameBoardProps {
  size?: number;
  squareSize?: number;
  layout?: string;
  botId?: string;
}

function GameBoard({ size = 15, squareSize = 50, layout, botId = 'random_bot' }: GameBoardProps) {
  const initialLayout = layout || createInitialLayout(size);
  const [boardLayout, setBoardLayout] = useState(initialLayout);
  const [isWaiting, setIsWaiting] = useState(false);

  const handleSquareClick = async (row: number, col: number) => {
    // Evitar clicks mientras el bot está pensando
    if (isWaiting) return; 
    
    const currentState = getLayoutState(boardLayout, row, col);
    
    // Solo permitir jugar en casillas vacías
    if (currentState !== '.') return;
    
    // Actualizar con el movimiento del jugador
    const newLayout = updateLayoutPosition(boardLayout, row, col, 'B');
    setBoardLayout(newLayout);
    
    // Llamar al bot
    setIsWaiting(true);
    try {
      const GAMEY_API_URL = import.meta.env.VITE_GAMEY_API_URL ?? 'http://localhost:4000';
      const res = await fetch(`${GAMEY_API_URL}/v1/ybot/choose/${botId}`, {
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
        // Actualizar con el movimiento del bot
        const { row: botRow, col: botCol } = coordToRowCol(botResponse.coords.x, botResponse.coords.y, size);
        const finalLayout = updateLayoutPosition(newLayout, botRow, botCol, 'R');
        setBoardLayout(finalLayout);
        console.log(botResponse);
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
          size={squareSize}
          row={row}
          col={col}
          state={state}
          onClick={handleSquareClick}
          disabled={isWaiting}
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
