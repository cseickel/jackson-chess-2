import React from "react";
import logo from "./logo.svg";
import "./App.css";
import Board from "./Components/Board/Board";
import GameDataProvider from "./Context/GameData";
import Status from "./Components/Status";
import Actions from "./Components/Actions";

function App() {
  return (
    <div className="App">
      <GameDataProvider>
        <Board />
        <div>
          <Status />
          <Actions />
        </div>
      </GameDataProvider>
    </div>
  );
}

export default App;
