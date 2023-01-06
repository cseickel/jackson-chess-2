import {
  GameData,
  GameDataState,
  getPositionOfPiece,
  getPriorBoardState,
  Piece,
  PieceName,
  Position,
} from "../Context/GameData";
import { deepCopy } from "../utils/deep-copy";
import { isInCheck } from "./check";

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

interface PieceWithPosition extends Piece {
  position: Position;
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
  return result;
};

const getCollisionType = (
  piece: PieceWithPosition,
  state: GameDataState,
  pos: Position
) => {
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
  piece: PieceWithPosition,
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
  piece: PieceWithPosition,
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
  piece: PieceWithPosition,
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
  piece: PieceWithPosition,
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

const getKnightMoves = (piece: PieceWithPosition, state: GameDataState) => {
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

const canEnPassant = (piece: PieceWithPosition, state: GameDataState) => {
  const lastMove = getPriorBoardState(state);
  if (!lastMove) {
    return false;
  }

  for (let testSide of [-1, 1]) {
    const otherPiece =
      state.piecesByLocation[piece.position.row][piece.position.col + testSide];
    if (
      otherPiece &&
      otherPiece.name === PieceName.Pawn &&
      otherPiece.color !== piece.color
    ) {
      const otherPiecePosition = getPositionOfPiece(otherPiece, state);
      if (!otherPiecePosition) {
        throw new Error(
          "Could not find position of other pawn when testing en passant"
        );
      }
      const otherPiecePriorPosition = getPositionOfPiece(otherPiece, lastMove);
      if (!otherPiecePriorPosition) {
        console.log("otherPiecePosition is null", otherPiece, lastMove);
        throw new Error(
          "otherPiecePriorPosition is null when testing en passant"
        );
      }
      if (
        (otherPiece.initialPosition.row === 1 &&
          otherPiecePosition.row === 3) ||
        (otherPiece.initialPosition.row === 6 && otherPiecePosition.row === 4)
      ) {
        // Maybe we can en passant, if the last move was a two square move
        if (otherPiecePriorPosition.row === otherPiece.initialPosition.row) {
          if (otherPiece.initialPosition.row === 1) {
            return {
              row: otherPiecePosition.row - 1,
              col: otherPiecePosition.col,
            };
          } else {
            return {
              row: otherPiecePosition.row + 1,
              col: otherPiecePosition.col,
            };
          }
        }
      }
    }
  }
};

const getPawnMoves = (piece: PieceWithPosition, state: GameDataState) => {
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

  // En passant
  const enPassant = canEnPassant(piece, state);
  if (enPassant) {
    moves.push(enPassant);
  }

  return moves;
};

const applyMove = (
  piece: PieceWithPosition,
  dest: Position,
  data: GameData
) => {
  const { row, col } = dest;
  const pieceAtDest = data.state.piecesByLocation[row][col];
  const newState: GameDataState = {
    ...deepCopy(data.state),
    activePlayer: data.state.activePlayer === "white" ? "black" : "white",
  };
  if (pieceAtDest) {
    newState.capturedPieces.push(pieceAtDest);
  } else {
    if (piece.name === PieceName.Pawn && piece.position.col !== col) {
      // This has to be an en passant
      const otherPawn = data.state.piecesByLocation[piece.position.row][col];
      if (!otherPawn) {
        throw new Error("En passant but no other pawn found");
      }
      if (otherPawn.name !== PieceName.Pawn) {
        throw new Error("En passant but other piece is not a pawn");
      }
      if (otherPawn.color === piece.color) {
        throw new Error("En passant but other pawn is same color");
      }
      newState.capturedPieces.push(otherPawn);
      newState.piecesByLocation[piece.position.row][col] = null;
    }
  }
  newState.piecesByLocation[piece.position.row][piece.position.col] = null;
  newState.piecesByLocation[row][col] = piece;
  newState.playersInCheck = new Map<string, boolean>();
  const newData = { state: newState, actions: data.actions };
  newState.playersInCheck.set("black", isInCheck(newData, "black"));
  newState.playersInCheck.set("white", isInCheck(newData, "white"));
  newState.playersInCheckMate = new Map<string, boolean>();
  return newState;
};

export const movePiece = (_piece: Piece, dest: Position, data: GameData) => {
  const piecePosition = getPositionOfPiece(_piece, data.state);
  if (!piecePosition) {
    throw new Error("Piece not found");
  }
  const piece = { ..._piece, position: piecePosition };
  const newState = applyMove(piece, dest, data);
  if (newState.playersInCheck.get(newState.activePlayer)!) {
    newState.playersInCheckMate.set(newState.activePlayer, true);
  }
  data.actions.setState(newState);
};

const willMoveCauseCheck = (
  piece: PieceWithPosition,
  move: Position,
  data: GameData
) => {
  const newState = applyMove(piece, move, data);
  return newState.playersInCheck.get(piece.color) || false;
};

export const getAllowedMoves = (_piece: Piece, data: GameData) => {
  const state = data.state;
  const piecePosition = getPositionOfPiece(_piece, state);
  if (!piecePosition) {
    throw new Error("Piece not found");
  }
  const piece = { ..._piece, position: piecePosition };
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
  return allAllowedMoves;
};

export const filterAllowedMoves = (
  _piece: Piece,
  moves: Position[],
  data: GameData
) => {
  const piecePosition = getPositionOfPiece(_piece, data.state);
  if (!piecePosition) {
    throw new Error("Piece not found");
  }
  const piece = { ..._piece, position: piecePosition };
  return moves.filter((move) => {
    const newState = applyMove(piece, move, data);
    const isInCheck = newState.playersInCheck.get(piece.color) || false;
    return !isInCheck;
  });
};
