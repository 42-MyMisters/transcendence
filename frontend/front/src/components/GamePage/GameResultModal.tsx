import { useSetAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import {
  isGameStartedAtom,
  isLoadingAtom,
  isMatchedAtom,
  isPrivateAtom,
  isGameQuitAtom,
} from "../../components/atom/GameAtom";
import "../../styles/GameResultModal.css";
import { gameResultModalAtom } from "../atom/ModalAtom";


export default function GameResultModal({
  result = "",
  leftScore = 0,
  rightScore = 0,
}: {
  result: string;
  leftScore: number;
  rightScore: number;
}) {
  const setIsLoading = useSetAtom(isLoadingAtom);
  const setIsMatched = useSetAtom(isMatchedAtom);
  const setIsPrivate = useSetAtom(isPrivateAtom);
  const setIsGameStart = useSetAtom(isGameStartedAtom);
  const setIsGameQuit = useSetAtom(isGameQuitAtom);
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
            setIsLoading(false);
            setIsMatched(false);
            setIsGameQuit(true);
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
