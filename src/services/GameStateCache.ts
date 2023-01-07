import { GameData, Piece, Position } from "../Context/GameData";
import { getAllowedMoves } from "./movement";

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
          this.piecePosition.set(piece.id, { row, col });
          this.allowedMovesByPosition[row][col] = getAllowedMoves(piece, data);
        }
      }
    }
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
    return JSON.stringify(data.state.piecesByLocation);
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
    return cached.isCheckMate.get(color);
  }
}

export const gameStateCache = new GameStateCache();
