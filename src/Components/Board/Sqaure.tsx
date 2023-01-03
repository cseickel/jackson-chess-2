import { Piece } from "../../Context/GameData";

export interface SquareProps {
  row: number;
  col: number;
  piece: any;
  isAllowedMove: boolean;
  clickHandler: (row: number, col: number, piece: Piece | null) => void;
}

export const Square = (props: SquareProps) => {
  const { row, col, piece, isAllowedMove, clickHandler } = props;

  const gridArea = `${row + 1} / ${col + 1} / ${row + 2} / ${col + 2}`;

  const color = (row + col) % 2 === 0 ? "white" : "black";
  const className = `square square-color-${color} ${isAllowedMove ? "allowed-move" : ""
    }`;
  return (
    <div className={className} style={{ gridArea: gridArea }}>
      <div
        className="square-content"
        onClick={() => clickHandler(row, col, piece)}
      >
        {piece && (
          <div>
            <img src={piece.image} alt={piece.name} />
          </div>
        )}
      </div>
    </div>
  );
};
