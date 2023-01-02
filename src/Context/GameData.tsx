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
  position: Position;
  initialPosition: Position;
}

export interface GameDataState {
  capturedPieces: Piece[];
  piecesByLocation: Array<Array<Piece | null>>;
  activePlayer: "white" | "black";
  selectedPiece: Piece | null;
  allowedMoves: Position[];
}

export interface GameDataContextActions {
  setState: (data: GameDataState) => void;
  resetGame: () => void;
}

export interface GameData {
  state: GameDataState;
  actions: GameDataContextActions;
}

export const getInitialGameState = () => {
  const data: GameDataState = {
    capturedPieces: [],
    activePlayer: "white",
    piecesByLocation: [],
    selectedPiece: null,
    allowedMoves: new Array<Position>(),
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

export const GameDataContext = createContext<GameData>(null as any);

const GameDataProvider = ({ children }: any) => {
  const [state, setState] = useState<GameDataState>(getInitialGameState());

  const resetGame = useCallback(() => {
    setState(getInitialGameState());
  }, [setState]);

  const data = useMemo(() => {
    const actions: GameDataContextActions = {
      setState,
      resetGame,
    };
    return { state, actions };
  }, [state, setState, resetGame]);

  return (
    <GameDataContext.Provider value={data}>{children}</GameDataContext.Provider>
  );
};

export default GameDataProvider;
