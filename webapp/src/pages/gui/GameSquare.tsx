
import './GameSquare.css';

interface GameSquareProps {
  row: number;
  col: number;
  state: string;
  onClick: (row: number, col: number) => void;
  disabled: boolean;
}

export default function GameSquare({ row, col, state, onClick, disabled }: GameSquareProps) {

  const getColor = () => {
    if (state === 'B') return 'blue';
    if (state === 'R') return 'red';
    return 'grey';
  };

  return (
    <div
      className="hexagon"
      data-row={row}
      data-col={col}
      style={{
        '--color': getColor(),
        '--cursor': disabled ? 'not-allowed' : 'pointer',
      } as React.CSSProperties}
      onClick={() => !disabled && onClick(row, col)}
    />
  );

}
