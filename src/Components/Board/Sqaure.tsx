import { Component, useCallback, useContext } from "react";
import { GameDataContext, Piece } from "../../Context/GameData";
import { getAllowedMoves } from "../../services/movement";

export interface SquareProps {
  row: number;
  col: number;
  piece: any;
  isAllowedMove: boolean;
}

export const Square = (props: SquareProps) => {
  const data = useContext(GameDataContext);
  const { row, col, piece, isAllowedMove } = props;
  const clickHandler = useCallback(
    (piece: Piece) => {
      console.log("clicked", piece);
      data.actions.setState({
        ...data.state,
        selectedPiece: piece,
        allowedMoves: getAllowedMoves(piece, data.state),
      });
    },
    [data]
  );

  const gridArea = `${row + 1} / ${col + 1} / ${row + 2} / ${col + 2}`;

  const color = (row + col) % 2 === 0 ? "white" : "black";
  const className = `square square-color-${color} ${isAllowedMove ? "allowed-move" : ""
    }`;
  return (
    <div className={className} style={{ gridArea: gridArea }}>
      <div className="square-content">
        {piece && (
          <div onClick={() => clickHandler(piece)}>
            <img src={piece.image} alt={piece.name} />
            <span>{piece.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};
