import { useContext, useMemo } from "react";
import { GameDataContext } from "../../Context/GameData";
import { Square, SquareProps } from "./Sqaure";

const Board = () => {
  const context = useContext(GameDataContext);
  const squares = useMemo(() => {
    const state = context.state;
    let squares = Array<SquareProps>();
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = state.piecesByLocation[row][col];
        const isAllowedMove = state.allowedMoves.some(
          (x) => x.row === row && x.col === col
        );
        squares.push({ row, col, piece, isAllowedMove });
      }
    }
    return squares;
  }, [context]);

  return (
    <div className="board">
      {squares.map((square, index) => {
        return <Square key={index} {...square} />;
      })}
    </div>
  );
};
export default Board;
