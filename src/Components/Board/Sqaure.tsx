import { useContext } from "react";
import {
  GameData,
  GameDataContext,
  Piece,
  PieceName,
} from "../../Context/GameData";

export interface SquareProps {
  row: number;
  col: number;
  piece: Piece | null;
  isAllowedMove: boolean;
  clickHandler: (row: number, col: number, piece: Piece | null) => void;
}

export const Square = (props: SquareProps) => {
  const data = useContext<GameData>(GameDataContext);
  const { row, col, piece, isAllowedMove, clickHandler } = props;

  const gridArea = `${row + 1} / ${col + 1} / ${row + 2} / ${col + 2}`;

  const color = (row + col) % 2 === 0 ? "white" : "black";
  let className = `square square-color-${color}`;

  if (isAllowedMove) className += " allowed-move";

  if (piece && piece.name === PieceName.King) {
    const isInCheck = data.state.playersInCheck.get(piece.color) || false;
    if (isInCheck) className += " in-check";
  }

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
