import React from 'react';
import logo from './logo.svg';
import './App.css';
import Board from './Components/Board/Board';
import GameDataProvider from './Context/GameData';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <GameDataProvider>
          <Board />
        </GameDataProvider>
      </header>
    </div>
  );
}

export default App;
