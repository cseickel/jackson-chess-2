import { createContext } from 'react';

export interface Piece {
  name: string;
  color: string;
  image: string;
  row: number;
  col: number;
}

export interface GameData {
  capturedPieces: Piece[];
  activePieces: Piece[];
  piecesByLocation: Piece[][];
  selectedPiece: Piece;
}

const GameData = createContext('Unknown');

const GameDataProvider = ({ children }: any) => {
  return <GameData.Provider value="Unknown">{children}</GameData.Provider>;
}

export default GameDataProvider;
