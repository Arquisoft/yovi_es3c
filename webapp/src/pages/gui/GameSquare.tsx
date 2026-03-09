
interface GameSquareProps {
  size: number;
  x: number;
  y: number;
  z: number;
  onClick: (x: number, y: number, z: number) => void;
}

export default function GameSquare({ size, x, y, z, onClick }: GameSquareProps) {
  return NormalSquare(size, x, y, z, onClick);
}

function NormalSquare(size: number, x: number, y: number, z: number, onClick: (x: number, y: number, z: number) => void) {
  return (
    <div
      className="hexagon"
      style={{
        height: size,
        aspectRatio: "0.866",
        clipPath: "polygon(-50% 50%, 50% 100%, 150% 50%, 50% 0)",
        background: "grey",
        border: "1px solid grey",
        cursor: "pointer",
      }}
      onClick={() => onClick(x, y, z)}
    />
  );
}



