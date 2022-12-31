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

enum CollisionType {
  None,
  Friendly,
  Enemy,
}

const filterOutOfBoundsMoves = (moves: Position[]) => {
  return moves.filter((move) => {
    return move.row >= 0 && move.row <= 7 && move.col >= 0 && move.col <= 7;
  });
};

const getCollisionType = (
  piece: Piece,
  state: GameDataState,
  pos: Position
) => {
  const pieceAtPos = state.piecesByLocation[pos.row][pos.col];
  if (!pieceAtPos) {
    return CollisionType.None;
  }
  if (pieceAtPos.color === piece.color) {
    return CollisionType.Friendly;
  }
  return CollisionType.Enemy;
};

const maybeAddMove = (
  piece: Piece,
  state: GameDataState,
  moves: Position[],
  pos: Position,
  canAttack: boolean
): boolean => {
  if (pos.row < 0 || pos.row > 7 || pos.col < 0 || pos.col > 7) {
    return false;
  }
  const collisionType = getCollisionType(piece, state, pos);
  if (collisionType === CollisionType.None) {
    moves.push(pos);
    return true;
  } else if (collisionType === CollisionType.Enemy && canAttack) {
    moves.push(pos);
  }
  return false;
};

const getStraightMoves = (
  piece: Piece,
  allowedRange: Range,
  state: GameDataState,
  canAttack = true
) => {
  const moves = new Array<Position>();
  const incr = allowedRange.min < allowedRange.max ? 1 : -1;
  for (let i = allowedRange.min; i <= allowedRange.max; i += incr) {
    const pos = { row: piece.position.row + i, col: piece.position.col };
    if (!maybeAddMove(piece, state, moves, pos, canAttack)) {
      break;
    }
  }
  return moves;
};

const getSidewaysMoves = (
  piece: Piece,
  allowedRange: Range,
  state: GameDataState
) => {
  const moves = new Array<Position>();
  const incr = allowedRange.min < allowedRange.max ? 1 : -1;
  for (let i = allowedRange.min; i <= allowedRange.max; i += incr) {
    const pos = { row: piece.position.row, col: piece.position.col + i };
    if (!maybeAddMove(piece, state, moves, pos, false)) {
      break;
    }
  }
  return moves;
};

const getDiagnalMoves = (
  piece: Piece,
  allowedRange: Range,
  state: GameDataState
) => {
  const moves = new Array<Position>();
  const incr = allowedRange.min < allowedRange.max ? 1 : -1;
  for (let i = allowedRange.min; i <= allowedRange.max; i += incr) {
    const pos = { row: piece.position.row + i, col: piece.position.col + i };
    if (!maybeAddMove(piece, state, moves, pos, false)) {
      break;
    }
  }
  for (let i = allowedRange.min; i <= allowedRange.max; i += incr) {
    const pos = { row: piece.position.row + i, col: piece.position.col - i };
    if (!maybeAddMove(piece, state, moves, pos, false)) {
      break;
    }
  }
  return filterOutOfBoundsMoves(moves);
};

const getKnightMoves = (piece: Piece, state: GameDataState) => {
  const maybeMoves = new Array<Position>();
  maybeMoves.push({ row: piece.position.row + 2, col: piece.position.col + 1 });
  maybeMoves.push({ row: piece.position.row + 2, col: piece.position.col - 1 });
  maybeMoves.push({ row: piece.position.row - 2, col: piece.position.col + 1 });
  maybeMoves.push({ row: piece.position.row - 2, col: piece.position.col - 1 });
  maybeMoves.push({ row: piece.position.row + 1, col: piece.position.col + 2 });
  maybeMoves.push({ row: piece.position.row + 1, col: piece.position.col - 2 });
  maybeMoves.push({ row: piece.position.row - 1, col: piece.position.col + 2 });
  maybeMoves.push({ row: piece.position.row - 1, col: piece.position.col - 2 });

  const moves = new Array<Position>();
  for (const maybeMove of maybeMoves) {
    maybeAddMove(piece, state, moves, maybeMove, true);
  }
  return moves;
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
    allAllowedMoves.push(
      ...getStraightMoves(piece, allowedRange, state, false)
    );
  }
  if (piece.name === PieceName.Knight) {
    allAllowedMoves.push(...getKnightMoves(piece, state));
  }
  if (piece.name === PieceName.Bishop || piece.name === PieceName.Queen) {
    allAllowedMoves.push(...getDiagnalMoves(piece, { min: 1, max: 7 }, state));
    allAllowedMoves.push(
      ...getDiagnalMoves(piece, { min: -1, max: -7 }, state)
    );
  }
  if (piece.name === PieceName.Rook || piece.name === PieceName.Queen) {
    allAllowedMoves.push(
      ...getSidewaysMoves(piece, { min: -7, max: 7 }, state)
    );
    allAllowedMoves.push(...getStraightMoves(piece, { min: 1, max: 7 }, state));
    allAllowedMoves.push(
      ...getStraightMoves(piece, { min: -7, max: -1 }, state)
    );
  }
  if (piece.name === PieceName.King) {
    allAllowedMoves.push(...getSidewaysMoves(piece, { min: 1, max: 1 }, state));
    allAllowedMoves.push(
      ...getSidewaysMoves(piece, { min: -1, max: -1 }, state)
    );
    allAllowedMoves.push(
      ...getStraightMoves(piece, { min: -1, max: 1 }, state)
    );
    allAllowedMoves.push(...getDiagnalMoves(piece, { min: 1, max: 1 }, state));
    allAllowedMoves.push(
      ...getDiagnalMoves(piece, { min: -1, max: -1 }, state)
    );
  }
  return allAllowedMoves;
};
