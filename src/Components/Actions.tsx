import { useContext } from "react";
import { GameDataContext } from "../Context/GameData";

const Actions = () => {
  const context = useContext(GameDataContext);

  return (
    <div className="actions">
      <button onClick={context.actions.resetGame}>Reset</button>
      <button onClick={context.actions.undo}>Undo</button>
    </div>
  );
};
export default Actions;
