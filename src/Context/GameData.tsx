import { createContext, useCallback, useMemo, useState } from "react";

export enum PieceType {
  Pawn,
  Rook,
  Knight,
  Bishop,
  Queen,
  King,
}

export interface Position {
  row: number;
  col: number;
}

export class Piece {
  id: string;
  type: PieceType;
  name: string;
  color: string;
  image: string;
  initialPosition: Position;

  constructor(name: PieceType, color: string, initialPosition: Position) {
    this.type = name;
    this.color = color;
    this.initialPosition = initialPosition;

    this.name = PieceType[name].toString();
    const imageName = this.type === PieceType.Knight ? "N" : this.name[0];
    this.image = `images/${color[0]}${imageName}.svg`;
    this.id = `${color}-${this.name}-${initialPosition.row}-${initialPosition.col}`;
  }

  public static fromId(id: string): Piece {
    const parts = id.split("-");
    if (parts.length !== 4) {
      throw new Error("Invalid piece id: " + id);
    }
    const color = parts[0];
    const name = PieceType[parts[1] as keyof typeof PieceType];
    const row = parseInt(parts[2]);
    const col = parseInt(parts[3]);
    const piece = new Piece(name, color, { row, col });
    return piece;
  }
}

export interface GameDataState {
  key?: string;
  capturedPieces: Piece[];
  piecesByLocation: Array<Array<Piece | null>>;
  activePlayer: string;
  history: GameDataState[];
  playerInCheck: boolean;
  playerInCheckMate: boolean;
}

export interface GameDataContextActions {
  setState: (data: GameDataState) => void;
  resetGame: () => void;
  undo: () => void;
}

export interface GameData {
  state: GameDataState;
  actions: GameDataContextActions;
}

const getInitialGameState = () => {
  const data: GameDataState = {
    capturedPieces: [],
    activePlayer: "white",
    piecesByLocation: [],
    history: [],
    playerInCheck: false,
    playerInCheckMate: false,
  };

  const piecePos = [
    PieceType.Rook,
    PieceType.Knight,
    PieceType.Bishop,
    PieceType.Queen,
    PieceType.King,
    PieceType.Bishop,
    PieceType.Knight,
    PieceType.Rook,
  ];

  for (let row = 0; row < 8; row++) {
    data.piecesByLocation[row] = Array.from({ length: 8 }, () => null);
    for (let col = 0; col < 8; col++) {
      const color = row > 2 ? "white" : "black";
      if (row === 1 || row === 6) {
        const position = { row, col };
        const piece = new Piece(PieceType.Pawn, color, position);
        data.piecesByLocation[row][col] = piece;
      }
      if (row === 0 || row === 7) {
        for (let col = 0; col < 8; col++) {
          const name = piecePos[col];
          const position = { row, col };
          const piece = new Piece(name, color, position);
          data.piecesByLocation[row][col] = piece;
        }
      }
    }
  }
  return data;
};

export const getPositionOfPiece = (piece: Piece, state: GameDataState) => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const currentPiece = state.piecesByLocation[row][col];
      if (currentPiece?.id === piece.id) {
        return { row, col };
      }
    }
  }
  return null;
};

export const getPriorBoardState = (state: GameDataState) => {
  let index = state.history.length - 1;
  while (index >= 0) {
    const priorState = state.history[index];
    if (priorState.activePlayer !== state.activePlayer) {
      return priorState;
    }
    index--;
  }
  return null;
};

export const GameDataContext = createContext<GameData>(null as any);

const GameDataProvider = ({ children }: any) => {
  const [state, setState] = useState<GameDataState>(getInitialGameState());
  const setStateWithHistory = useCallback(
    (data: GameDataState) => {
      setState((prevState) => {
        return {
          ...data,
          history: [...prevState.history, prevState],
        };
      });
    },
    [setState]
  );

  const resetGame = useCallback(() => {
    setState(getInitialGameState());
  }, [setState]);

  const data = useMemo(() => {
    const actions: GameDataContextActions = {
      setState: setStateWithHistory,
      resetGame,
      undo: () => {
        const priorState = getPriorBoardState(state);
        if (priorState) {
          setState(priorState);
        }
      },
    };
    return { state, actions };
  }, [state, setState, setStateWithHistory, resetGame]);

  return (
    <GameDataContext.Provider value={data}>{children}</GameDataContext.Provider>
  );
};

export default GameDataProvider;
