import { GameData, Piece, PieceType, Position } from "../Context/GameData";
import { gameStateCache } from "./GameStateCache";

const findKing = (data: GameData, color: string) => {
  const initialPosition = { row: color === "white" ? 7 : 0, col: 4 };
  const king = new Piece(PieceType.King, color, initialPosition);
  const kingPos = gameStateCache.getPiecePosition(data, king);
  if (!kingPos) {
    throw new Error("King not found");
  }
  return kingPos;
};

const isChecking = (
  data: GameData,
  attackingPiece: Piece,
  kingPos: Position
) => {
  const allowedMoves = gameStateCache.getAllowMoves(data, attackingPiece);
  if (
    allowedMoves.some(
      (move) => move.row === kingPos.row && move.col === kingPos.col
    )
  ) {
    return true;
  }
  return false;
};

export const isInCheck = (data: GameData, color: string): boolean => {
  const cached = gameStateCache.getIsCheck(data, color);
  if (cached !== undefined) {
    console.log("Using cached isCheck");
    return cached;
  }
  const state = data.state;
  const king = findKing(data, color);
  console.log("king", king);
  const opponentColor = color === "white" ? "black" : "white";
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = state.piecesByLocation[row][col];
      if (piece && piece.color === opponentColor) {
        if (isChecking(data, piece, king)) {
          console.log(piece.name, "is checking", color);
          gameStateCache.setIsCheck(data, color, true);
          return true;
        } else {
          console.log(piece.name, "is not checking", color);
        }
      }
    }
  }
  gameStateCache.setIsCheck(data, color, false);
  return false;
};
