import {
  GameData,
  GameDataState,
  getPositionOfPiece,
  Piece,
  PieceName,
  Position,
} from "../Context/GameData";
import { filterAllowedMoves, getAllowedMoves } from "./movement";
import { gameStateCache } from "./GameStateCache";

const findKing = (state: GameDataState, color: "white" | "black") => {
  const initialPosition = { row: color === "white" ? 7 : 0, col: 4 };
  const king: Piece = {
    id: `${color}-king-{initialPosition.row}-{initialPosition.col}`,
    name: PieceName.King,
    image: "",
    color,
    initialPosition,
  };
  const kingPos = getPositionOfPiece(king, state);
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

export const isInCheck = (
  data: GameData,
  color: "white" | "black"
): boolean => {
  const cached = gameStateCache.getIsCheck(data, color);
  if (cached !== undefined) {
    return cached;
  }
  const state = data.state;
  const king = findKing(state, color);
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

export const isInCheckmate = (data: GameData, color: "white" | "black") => {
  const cached = gameStateCache.getIsCheckMate(data, color);
  if (cached !== undefined) {
    return cached;
  }
  const state = data.state;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = state.piecesByLocation[row][col];
      if (piece && piece.color === color) {
        const allowedMoves = getAllowedMoves(piece, data);
        const allowedMovesWithoutCheck = filterAllowedMoves(
          piece,
          allowedMoves,
          data
        );
        if (allowedMovesWithoutCheck.length > 0) {
          gameStateCache.setIsCheckMate(data, color, false);
          return false;
        }
      }
    }
  }
  gameStateCache.setIsCheckMate(data, color, true);
  return true;
};
