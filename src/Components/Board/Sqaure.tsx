import { Component, useCallback, useContext } from "react";
import { GameDataContext, Piece } from "../../Context/GameData";
import { getAllowedMoves, movePiece } from "../../services/movement";

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
    (clickedPiece: Piece) => {
      console.log("clicked", clickedPiece);
      const selectedPiece = data.state.selectedPiece;
      if (isAllowedMove && selectedPiece) {
        movePiece(selectedPiece, { row, col }, data);
        return;
      }
      if (clickedPiece && clickedPiece.color === data.state.activePlayer) {
        data.actions.setState({
          ...data.state,
          isMoveInProgress: true,
          selectedPiece: clickedPiece,
          allowedMoves: getAllowedMoves(clickedPiece, data.state),
        });
      }
    },
    [data, isAllowedMove, row, col]
  );

  const gridArea = `${row + 1} / ${col + 1} / ${row + 2} / ${col + 2}`;

  const color = (row + col) % 2 === 0 ? "white" : "black";
  const className = `square square-color-${color} ${isAllowedMove ? "allowed-move" : ""
    }`;
  return (
    <div className={className} style={{ gridArea: gridArea }}>
      <div className="square-content" onClick={() => clickHandler(piece)}>
        {piece && (
          <div>
            <img src={piece.image} alt={piece.name} />
          </div>
        )}
      </div>
    </div>
  );
};
