import { Component } from "react";

export interface SquareProps {
  row: number;
  col: number;
  piece: any;
}

export const Square = (props: SquareProps) => {
  const {
    row,
    col,
    piece
  } = props;

  const gridArea = `${row+1} / ${col+1} / ${row+2} / ${col+2}`;
  
  const color = (row + col) % 2 === 0 ? 'white' : 'black';
  return (
    <div className={"square square-color-" + color} style={{gridArea: gridArea}}>
      {piece && 
        <div>
          <img src={piece.image} alt={piece.name} />
          <span>{piece.name}</span>
        </div>
      }
    </div>
  );
}
