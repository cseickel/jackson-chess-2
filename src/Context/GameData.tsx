import { createContext } from "react";

export interface Piece {
  name: string;
  color: string;
  image: string;
  row: number;
  col: number;
}

export interface GameData {
  capturedPieces: Piece[];
  piecesByLocation: Piece[][];
  selectedPiece: Piece | null;
}

const data: GameData = {
  capturedPieces: [],
  piecesByLocation: [],
  selectedPiece: null,
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
  data.piecesByLocation[row] = [];
  for (let col = 0; col < 8; col++) {
    const color = row > 2 ? "white" : "black";
    if (row === 1 || row === 6) {
      const piece = {
        name: "Pawn",
        color,
        row,
        col,
        image: `images/${color[0]}P.svg`,
      };
      data.piecesByLocation[row][col] = piece;
    }
    if (row === 0 || row === 7) {
      for (let col = 0; col < 8; col++) {
        const name = piecePos[col];
        const imageName = name === "Knight" ? "N" : name[0];
        const piece = {
          name: piecePos[col],
          color,
          row,
          col,
          image: `images/${color[0]}${imageName}.svg`,
        };
        data.piecesByLocation[row][col] = piece;
      }
    }
  }
}

export const GameDataContext = createContext<GameData>(data);

const GameDataProvider = ({ children }: any) => {
  return (
    <GameDataContext.Provider value={data}>{children}</GameDataContext.Provider>
  );
};

export default GameDataProvider;
