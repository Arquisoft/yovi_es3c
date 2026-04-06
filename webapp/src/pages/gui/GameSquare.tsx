
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(row, col);
    }
  };

  return (
    <div
      className="hexagon"
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      data-row={row}
      data-col={col}
      style={{
        '--color': getColor(),
        '--cursor': disabled ? 'not-allowed' : 'pointer',
      } as React.CSSProperties}
      onClick={() => !disabled && onClick(row, col)}
      onKeyDown={handleKeyDown}
    />
  );
}