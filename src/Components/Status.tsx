import { useContext, useMemo } from "react";
import { GameDataContext } from "../Context/GameData";

const Status = () => {
  const context = useContext(GameDataContext);
  const player = context.state.activePlayer;
  const checkMate = context.state.playerInCheckMate;

  return (
    <div className="status">
      <span>Active Player:</span>
      <br />
      <span>{player[0].toUpperCase() + player.substr(1)}</span>
      <br />
      {checkMate && (
        <span>
          <b>Check Mate!</b>
        </span>
      )}
    </div>
  );
};
export default Status;
