
import GameSquare from './GameSquare';

const board = {
    size: 12,
    squareSize:60
};


function GameBoard(){

    const rows = [];

  for (let row = 0; row < board.size; row++) {
    const elements = [];

    for (let col = 0; col < board.size - row; col++) {
      elements.push(
        GameSquare(board.squareSize)
      );
    }

    rows.push(
      <div
        key={row}
        style={{
          display: "flex",
          gap: "4px",
          marginLeft: `${((row+1) * board.squareSize/2)-(row+2)}px`,
          marginTop:"-11px"
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
