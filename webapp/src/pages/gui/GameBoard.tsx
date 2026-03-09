
import GameSquare from './GameSquare';

interface GameBoardProps {
  size?: number;
  squareSize?: number;
  onPlay: (x: number, y: number, z: number) => void;
}

function GameBoard({ size = 15, squareSize = 50, onPlay }: GameBoardProps) {
  const rows = [];

  for (let row = 0; row < size; row++) {
    const elements = [];

    for (let col = 0; col < row + 1; col++) {
      const x = size - 1 - row;
      const y = col;
      const z = row - col;
      
      elements.push(
        <GameSquare
          key={`${x}-${y}-${z}`}
          size={squareSize}
          x={x}
          y={y}
          z={z}
          onClick={onPlay}
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
    <div style={{ display: "flex", flexDirection: "column" }}>
      {rows}
    </div>
  );
}

export default GameBoard;
