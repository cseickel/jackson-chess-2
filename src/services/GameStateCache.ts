import { GameData, Piece, PieceType, Position } from "../Context/GameData";
import { applyMove, getAllowedMoves } from "./movement";

class StateCacheData {
  public allowedMovesByPosition: Array<Array<Array<Position>>>;
  public piecePosition: Map<string, Position>;
  public isCheck: Map<string, boolean>;
  public isCheckMate: Map<string, boolean>;

  constructor(data: GameData) {
    this.isCheck = new Map<string, boolean>();
    this.isCheckMate = new Map<string, boolean>();
    this.piecePosition = new Map<string, Position>();
    this.allowedMovesByPosition = [];
    for (let row = 0; row < 8; row++) {
      this.allowedMovesByPosition[row] = [];
      for (let col = 0; col < 8; col++) {
        const piece = data.state.piecesByLocation[row][col];
        if (piece) {
          console.log("getting allowed moves for", piece.name);
          this.piecePosition.set(piece.id, { row, col });
          const allowedMoves = getAllowedMoves(piece, data);
          const allowedMovesWithoutCheck = this.getMovesWithoutSelfCheck(
            data,
            piece,
            { row, col },
            allowedMoves
          );
          this.allowedMovesByPosition[row][col] = allowedMovesWithoutCheck;
        }
      }
    }
  }

  private getMovesWithoutSelfCheck(
    data: GameData,
    _piece: Piece,
    position: Position,
    moves: Position[]
  ): Array<Position> {
    const piece = { ..._piece, position };
    return moves.filter((move) => {
      const newState = applyMove(piece, move, data, false);
      return !newState.playerInCheck;
    });
  }

  private calculateIsCheckMate(data: GameData, color: string): boolean {
    return false;
    this.piecePosition.forEach((pos, id) => {
      const piece = Piece.fromId(id);
      if (piece && piece.color === color) {
        const allowedMoves = this.getAllowedMoves(piece);
        if (allowedMoves.length > 0) {
          return false;
        }
      }
    });
    gameStateCache.setIsCheckMate(data, color, true);
    console.log("Checkmate");
    return true;
  }

  getIsCheckMate(data: GameData, color: string): boolean {
    const cached = this.isCheckMate.get(color);
    if (cached !== undefined) {
      console.log("Using cached isCheckMate");
      return cached;
    }
    const result = this.calculateIsCheckMate(data, color);
    this.isCheckMate.set(color, result);
    return result;
  }

  getAllowedMoves(piece: Piece): Array<Position> {
    const pos = this.piecePosition.get(piece.id);
    if (!pos) {
      throw new Error("Piece not found");
    }
    const { row, col } = pos;
    return this.allowedMovesByPosition[row][col];
  }
}

class GameStateCache {
  private _states: Map<string, StateCacheData>;

  constructor() {
    this._states = new Map();
  }

  getKey(data: GameData) {
    if (data.state.key) {
      return data.state.key;
    }
    let ids = [];
    for (let row = 0; row < 8; row++) {
      ids.push(new Array(8));
      for (let col = 0; col < 8; col++) {
        const piece = data.state.piecesByLocation[row][col];
        if (piece) {
          ids[row][col] = piece.id;
        } else {
          ids[row][col] = 0;
        }
      }
    }
    const key = JSON.stringify(ids);
    data.state.key = key;
    return key;
  }

  getCached(data: GameData) {
    const key = this.getKey(data);
    let cached = this._states.get(key);
    if (!cached) {
      cached = new StateCacheData(data);
      this._states.set(key, cached);
    }
    return cached;
  }

  getAllowMoves(data: GameData, piece: Piece) {
    const cached = this.getCached(data);
    return cached.getAllowedMoves(piece);
  }

  setIsCheck(data: GameData, color: string, isCheck: boolean) {
    const cached = this.getCached(data);
    cached.isCheck.set(color, isCheck);
  }

  getIsCheck(data: GameData, color: string) {
    const cached = this.getCached(data);
    return cached.isCheck.get(color);
  }

  setIsCheckMate(data: GameData, color: string, isCheckMate: boolean) {
    const cached = this.getCached(data);
    cached.isCheckMate.set(color, isCheckMate);
  }

  getIsCheckMate(data: GameData, color: string) {
    const cached = this.getCached(data);
    return cached.getIsCheckMate(data, color);
  }

  getPiecePosition(data: GameData, piece: Piece) {
    const cached = this.getCached(data);
    return cached.piecePosition.get(piece.id);
  }
}

export const gameStateCache = new GameStateCache();
