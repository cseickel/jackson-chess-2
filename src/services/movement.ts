import { Piece } from "../Context/GameData";

export interface Position {
  column: number;
  row: number;
}

export interface Range {
  min: number;
  max: number;
}

const getForwardMoves = (pos: Position, allowedRange: Range) => { };

const getBackwardsMoves = (pos: Position, allowedRange: Range) => { };

const getSidewaysMoves = (pos: Position, allowedRange: Range) => { };

const getDiagnalMoves = (pos: Position, allowedRange: Range) => { };

const getKnightMoves = (pos: Position, allowedRange: Range) => { };

export const getAllowedMoves = (piece: Piece, pos: Position) => { };
