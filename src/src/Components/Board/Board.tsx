import { useMemo } from "react";
import { Piece } from "../../Context/GameData";
import { Square, SquareProps } from "./Sqaure";

const Board = () => {
  const squares = useMemo(() => {
    let squares = Array<SquareProps>();
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        squares.push({row, col, piece: null});
      }
    }
    return squares;
  }, []);

  return (
    <div className="board">
      {
        squares.map((square, index) => {
          return (<Square key={index} {...square} />);
        })
      }
    </div>
  );
}
export default Board;
