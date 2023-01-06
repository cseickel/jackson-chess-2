import { createContext, useCallback, useMemo, useState } from "react";

export enum PieceName {
  Pawn = "Pawn",
  Rook = "Rook",
  Knight = "Knight",
  Bishop = "Bishop",
  Queen = "Queen",
  King = "King",
}

export interface Position {
  row: number;
  col: number;
}

export interface Piece {
  name: PieceName;
  color: string;
  image: string;
  initialPosition: Position;
}

export interface GameDataState {
  capturedPieces: Piece[];
  piecesByLocation: Array<Array<Piece | null>>;
  activePlayer: "white" | "black";
  history: GameDataState[];
  playersInCheck: Map<string, boolean>;
  playersInCheckMate: Map<string, boolean>;
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
    playersInCheck: new Map<string, boolean>(),
    playersInCheckMate: new Map<string, boolean>(),
  };

  const piecePos = [
    "Rook",
    "Knight",
    "Bishop",
    "Queen",
    "King",
    "Bishop",
    "Knight",
    "Rook",
  ];

  for (let row = 0; row < 8; row++) {
    data.piecesByLocation[row] = Array.from({ length: 8 }, () => null);
    for (let col = 0; col < 8; col++) {
      const color = row > 2 ? "white" : "black";
      if (row === 1 || row === 6) {
        const position = { row, col };
        const piece = {
          name: PieceName.Pawn,
          color,
          position,
          initialPosition: position,
          image: `images/${color[0]}P.svg`,
        };
        data.piecesByLocation[row][col] = piece;
      }
      if (row === 0 || row === 7) {
        for (let col = 0; col < 8; col++) {
          const name = piecePos[col];
          const imageName = name === "Knight" ? "N" : name[0];
          const position = { row, col };
          const piece = {
            name: piecePos[col] as PieceName,
            color,
            position,
            initialPosition: position,
            image: `images/${color[0]}${imageName}.svg`,
          };
          data.piecesByLocation[row][col] = piece;
        }
      }
    }
  }
  return data;
};

export const getPositionOfPiece = (piece: Piece, state: GameDataState) => {
  const tRow = piece.initialPosition.row;
  const tCol = piece.initialPosition.col;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const currentPiece = state.piecesByLocation[row][col];
      if (
        currentPiece?.initialPosition.row === tRow &&
        currentPiece?.initialPosition.col === tCol
      ) {
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
