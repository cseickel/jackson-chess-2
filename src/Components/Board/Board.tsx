import { useContext, useMemo, useState, useCallback } from "react";
import { GameDataContext, Piece, Position } from "../../Context/GameData";
import { gameStateCache } from "../../services/GameStateCache";
import {
  filterAllowedMoves,
  getAllowedMoves,
  movePiece,
} from "../../services/movement";
import { Square, SquareProps } from "./Sqaure";

const Board = () => {
  const context = useContext(GameDataContext);
  const [allowedMoves, setAllowedMoves] = useState<Position[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);

  const clickHandler = useCallback(
    (row: number, col: number, clickedPiece: Piece | null) => {
      console.log("clicked", clickedPiece);
      const isAllowedMove = allowedMoves.some(
        (pos: Position) => pos.row === row && pos.col === col
      );
      if (isAllowedMove && selectedPiece) {
        movePiece(selectedPiece, { row, col }, context);
        setSelectedPiece(null);
        setAllowedMoves([]);
        return;
      }
      if (clickedPiece && clickedPiece.color === context.state.activePlayer) {
        setSelectedPiece(clickedPiece);
        const allowedMoves = gameStateCache.getAllowMoves(
          context,
          clickedPiece
        );
        const nonCheckingMoves = filterAllowedMoves(
          clickedPiece,
          allowedMoves,
          context
        );
        setAllowedMoves(nonCheckingMoves);
      }
    },
    [allowedMoves, context, selectedPiece, setSelectedPiece, setAllowedMoves]
  );

  const squares = useMemo(() => {
    const state = context.state;
    let squares = Array<SquareProps>();
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = state.piecesByLocation[row][col];
        const isAllowedMove = allowedMoves.some(
          (x) => x.row === row && x.col === col
        );
        squares.push({ row, col, piece, isAllowedMove, clickHandler });
      }
    }
    return squares;
  }, [context, allowedMoves]);

  return (
    <div className="board">
      {squares.map((square, index) => {
        return <Square key={index} {...square} />;
      })}
    </div>
  );
};
export default Board;
