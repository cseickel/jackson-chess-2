import {
  GameData,
  GameDataState,
  Piece,
  PieceName,
  Position,
} from "../Context/GameData";

export interface Range {
  min: number;
  max: number;
}

const filterOutOfBoundsMoves = (moves: Position[]) => {
  return moves.filter((move) => {
    return move.row >= 0 && move.row <= 7 && move.col >= 0 && move.col <= 7;
  });
};

const getForwardMoves = (piece: Piece, allowedRange: Range) => {
  const moves = new Array<Position>();
  const incr = allowedRange.min < allowedRange.max ? 1 : -1;
  for (let i = allowedRange.min; i <= allowedRange.max; i += incr) {
    moves.push({ row: piece.position.row + i, col: piece.position.col });
  }
  return filterOutOfBoundsMoves(moves);
};

const getSidewaysMoves = (piece: Piece, allowedRange: Range) => {
  const moves = new Array<Position>();
  const incr = allowedRange.min < allowedRange.max ? 1 : -1;
  for (let i = allowedRange.min; i <= allowedRange.max; i += incr) {
    moves.push({ row: piece.position.row, col: piece.position.col + i });
  }
  return filterOutOfBoundsMoves(moves);
};

const getDiagnalMoves = (piece: Piece, allowedRange: Range) => {
  const moves = new Array<Position>();
  const incr = allowedRange.min < allowedRange.max ? 1 : -1;
  for (let i = allowedRange.min; i <= allowedRange.max; i += incr) {
    moves.push({ row: piece.position.row + i, col: piece.position.col + i });
    moves.push({ row: piece.position.row + i, col: piece.position.col - i });
  }
  return filterOutOfBoundsMoves(moves);
};

const getKnightMoves = (piece: Piece) => {
  const moves = new Array<Position>();
  moves.push({ row: piece.position.row + 2, col: piece.position.col + 1 });
  moves.push({ row: piece.position.row + 2, col: piece.position.col - 1 });
  moves.push({ row: piece.position.row - 2, col: piece.position.col + 1 });
  moves.push({ row: piece.position.row - 2, col: piece.position.col - 1 });
  moves.push({ row: piece.position.row + 1, col: piece.position.col + 2 });
  moves.push({ row: piece.position.row + 1, col: piece.position.col - 2 });
  moves.push({ row: piece.position.row - 1, col: piece.position.col + 2 });
  moves.push({ row: piece.position.row - 1, col: piece.position.col - 2 });
  return filterOutOfBoundsMoves(moves);
};

export const getAllowedMoves = (piece: Piece, state: GameDataState) => {
  const allAllowedMoves = [];
  if (piece.name === PieceName.Pawn) {
    let allowedRange: Range = { min: 1, max: 1 };
    if (piece.initialPosition.row <= 4) {
      allowedRange = { min: 1, max: 1 };
      if (piece.position.row === piece.initialPosition.row) {
        // first move
        allowedRange = { min: 1, max: 2 };
      }
      // Pawn attacks
      if (
        state.piecesByLocation[piece.position.row + 1][piece.position.col + 1]
      ) {
        allAllowedMoves.push({
          row: piece.position.row + 1,
          col: piece.position.col + 1,
        });
      }
      if (
        state.piecesByLocation[piece.position.row + 1][piece.position.col - 1]
      ) {
        allAllowedMoves.push({
          row: piece.position.row + 1,
          col: piece.position.col - 1,
        });
      }
    } else {
      allowedRange = { min: -1, max: -1 };
      if (piece.position.row === piece.initialPosition.row) {
        // first move
        allowedRange = { min: -1, max: -2 };
      }
      // Pawn attacks
      if (
        state.piecesByLocation[piece.position.row - 1][piece.position.col + 1]
      ) {
        allAllowedMoves.push({
          row: piece.position.row - 1,
          col: piece.position.col + 1,
        });
      }
      if (
        state.piecesByLocation[piece.position.row - 1][piece.position.col - 1]
      ) {
        allAllowedMoves.push({
          row: piece.position.row - 1,
          col: piece.position.col - 1,
        });
      }
    }
    allAllowedMoves.push(...getForwardMoves(piece, allowedRange));
  }
  if (piece.name === PieceName.Knight) {
    allAllowedMoves.push(...getKnightMoves(piece));
  }
  if (piece.name === PieceName.Bishop || piece.name === PieceName.Queen) {
    allAllowedMoves.push(...getDiagnalMoves(piece, { min: -7, max: 7 }));
  }
  if (piece.name === PieceName.Rook || piece.name === PieceName.Queen) {
    allAllowedMoves.push(...getSidewaysMoves(piece, { min: -7, max: 7 }));
    allAllowedMoves.push(...getForwardMoves(piece, { min: -7, max: 7 }));
  }
  if (piece.name === PieceName.King) {
    allAllowedMoves.push(...getSidewaysMoves(piece, { min: -1, max: 1 }));
    allAllowedMoves.push(...getForwardMoves(piece, { min: -1, max: 1 }));
    allAllowedMoves.push(...getDiagnalMoves(piece, { min: -1, max: 1 }));
  }
  return allAllowedMoves;
};
