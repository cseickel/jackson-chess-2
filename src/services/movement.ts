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
  OutOfBounds,
}

const filterOutOfBoundsMoves = (moves: Position[]) => {
  return moves.filter((move) => {
    return move.row >= 0 && move.row <= 8 && move.col >= 0 && move.col <= 8;
  });
};

const range = (start: number, end: number) => {
  let result: Array<number>;
  if (end >= start) {
    result = Array.from({ length: end - start }, (_, k) => k + start);
  } else {
    result = Array.from({ length: start - end }, (_, k) => start - k);
  }
  console.log("range", start, end, result);
  return result;
};

const getCollisionType = (
  piece: Piece,
  state: GameDataState,
  pos: Position
) => {
  console.log("getCollisionType", piece, state, pos);
  if (pos.row < 0 || pos.row > 7 || pos.col < 0 || pos.col > 7) {
    return CollisionType.OutOfBounds;
  }
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
  for (let i of range(allowedRange.min, allowedRange.max)) {
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
  for (let i of range(allowedRange.min, allowedRange.max)) {
    const pos = { row: piece.position.row, col: piece.position.col + i };
    if (!maybeAddMove(piece, state, moves, pos, true)) {
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
  for (let i of range(allowedRange.min, allowedRange.max)) {
    const pos = { row: piece.position.row + i, col: piece.position.col + i };
    if (!maybeAddMove(piece, state, moves, pos, true)) {
      break;
    }
  }
  for (let i of range(allowedRange.min, allowedRange.max)) {
    const pos = { row: piece.position.row + i, col: piece.position.col - i };
    if (!maybeAddMove(piece, state, moves, pos, true)) {
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

const getPawnMoves = (piece: Piece, state: GameDataState) => {
  const moves = new Array<Position>();
  const dir = piece.initialPosition.row < 4 ? 1 : -1;
  const pos = { row: piece.position.row + dir, col: piece.position.col };
  maybeAddMove(piece, state, moves, pos, false);
  if (piece.position.row === piece.initialPosition.row) {
    // first move
    const pos = { row: piece.position.row + dir * 2, col: piece.position.col };
    maybeAddMove(piece, state, moves, pos, false);
  }

  // Pawn attacks
  const pieceAtUpLeft =
    state.piecesByLocation[piece.position.row + dir][piece.position.col - 1];
  const pieceAtUpRight =
    state.piecesByLocation[piece.position.row + dir][piece.position.col + 1];
  if (pieceAtUpRight && pieceAtUpRight.color !== piece.color) {
    moves.push({
      row: piece.position.row + dir,
      col: piece.position.col + 1,
    });
  }
  if (pieceAtUpLeft && pieceAtUpLeft.color !== piece.color) {
    moves.push({
      row: piece.position.row + dir,
      col: piece.position.col - 1,
    });
  }
  return moves;
};

export const getAllowedMoves = (piece: Piece, state: GameDataState) => {
  const allAllowedMoves = [];
  if (piece.name === PieceName.Pawn) {
    allAllowedMoves.push(...getPawnMoves(piece, state));
  }
  if (piece.name === PieceName.Knight) {
    allAllowedMoves.push(...getKnightMoves(piece, state));
  }
  if (piece.name === PieceName.Bishop || piece.name === PieceName.Queen) {
    allAllowedMoves.push(...getDiagnalMoves(piece, { min: 1, max: 8 }, state));
    allAllowedMoves.push(
      ...getDiagnalMoves(piece, { min: -1, max: -8 }, state)
    );
  }
  if (piece.name === PieceName.Rook || piece.name === PieceName.Queen) {
    allAllowedMoves.push(...getSidewaysMoves(piece, { min: 1, max: 8 }, state));
    allAllowedMoves.push(
      ...getSidewaysMoves(piece, { min: -1, max: -8 }, state)
    );
    allAllowedMoves.push(...getStraightMoves(piece, { min: 1, max: 8 }, state));
    allAllowedMoves.push(
      ...getStraightMoves(piece, { min: -1, max: -8 }, state)
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
  console.log("allAllowedMoves", allAllowedMoves);
  return allAllowedMoves;
};

export const movePiece = (piece: Piece, dest: Position, data: GameData) => {
  const { row, col } = dest;
  const pieceAtDest = data.state.piecesByLocation[row][col];
  const newState: GameDataState = {
    ...data.state,
    activePlayer: data.state.activePlayer === "white" ? "black" : "white",
    selectedPiece: null,
    allowedMoves: [],
  };
  if (pieceAtDest) {
    newState.capturedPieces.push(pieceAtDest);
  }
  newState.piecesByLocation[piece.position.row][piece.position.col] = null;
  newState.piecesByLocation[row][col] = piece;
  piece.position = { row, col };
  data.actions.setState(newState);
};
