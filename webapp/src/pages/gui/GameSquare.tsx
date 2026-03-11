
interface GameSquareProps {
  size: number;
  row: number;
  col: number;
  state: string;
  onClick: (row: number, col: number) => void;
  disabled: boolean;
}

export default function GameSquare({ size, row, col, state, onClick, disabled }: GameSquareProps) {
   
  const getColor = () => {
    if (state === 'B') return 'blue';
    if (state === 'R') return 'red';
    return 'grey';
  };

  return (
    <div
      className="hexagon"
      style={{
        height: size,
        aspectRatio: "0.866",
        clipPath: "polygon(-50% 50%, 50% 100%, 150% 50%, 50% 0)",
        background: getColor(),
        border: "1px solid grey",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      onClick={() => !disabled && onClick(row, col)}
    />
  );

}
