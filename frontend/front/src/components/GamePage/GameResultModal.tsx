import { useSetAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import {
  isGameStartedAtom,
  isPrivateAtom,
} from "../../components/atom/GameAtom";
import "../../styles/GameResultModal.css";
import { gameResultModalAtom } from "../atom/ModalAtom";


export default function GameResultModal({
  result,
  leftScore,
  rightScore,
}: {
  result: boolean;
  leftScore: number;
  rightScore: number;
}) {
  const setIsGameStart = useSetAtom(isGameStartedAtom);
  const setIsPrivate = useSetAtom(isPrivateAtom);
  const setGameResultModal = useSetAtom(gameResultModalAtom);
  const navigate = useNavigate();

  return (
    <>
      <div className="GameResultModalBG" />
      <div className="GameResultModal">
        <div className="GameResultModalTxt">{result ? "You Win!" : "You Lose"}</div>
        <div className="GameResultModalScore">{`${leftScore} : ${rightScore}`}</div>
        <button
          className="GameResultModalBtn"
          onClick={() => {
            setIsPrivate(false);
            setIsGameStart(false);
            setGameResultModal(false);
            navigate("/chat");
          }}
        >
          OK
        </button>
      </div>
    </>
  );
}
