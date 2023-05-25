import { useNavigate } from "react-router-dom";
import { PressKey } from "../../event/event.util";
import "../../styles/GameResultModal.css";


export default function GameLeftModal({
  userName
}: {
  userName: string
}) {
  const navigate = useNavigate();

  const handlerGameQuit = () => {
    navigate("/chat");
  };

  PressKey(["Escape"], () => {
    handlerGameQuit();
  });

  return (
    <>
      <div className="GameResultModalBG" />
      <div className="GameResultModal">
        <div className="GameResultModalTxt">{`${userName}`}</div>
        <div className="GameResultModalScore">{`\nleft the Game!`}</div>
        <button className="GameResultModalBtn" onClick={handlerGameQuit}>
          OK
        </button>
      </div>
    </>
  );
}
