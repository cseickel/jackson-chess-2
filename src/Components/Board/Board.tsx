import { useContext, useMemo } from "react";
import { GameData, GameDataContext, Piece } from "../../Context/GameData";
import { Square, SquareProps } from "./Sqaure";

const Board = () => {
  const data = useContext<GameData>(GameDataContext);
  const squares = useMemo(() => {
    let squares = Array<SquareProps>();
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = data.piecesByLocation[row][col];
        squares.push({row, col, piece});
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
