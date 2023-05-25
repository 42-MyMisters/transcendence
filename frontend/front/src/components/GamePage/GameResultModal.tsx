import { useAtomValue, useSetAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import {
  gameWinnerAtom, isGameQuitAtom, isGameStartedAtom,
  isLoadingAtom,
  isMatchedAtom,
  isPrivateAtom
} from "../../components/atom/GameAtom";
import { PressKey } from "../../event/event.util";
import "../../styles/GameResultModal.css";
import { userListAtom } from "../atom/ChatAtom";
import { gameResultModalAtom } from "../atom/ModalAtom";


export default function GameResultModal({
  leftScore = 0,
  rightScore = 0,
}: {
  leftScore: number;
  rightScore: number;
}) {
  const setIsLoading = useSetAtom(isLoadingAtom);
  const setIsMatched = useSetAtom(isMatchedAtom);
  const setIsPrivate = useSetAtom(isPrivateAtom);
  const setIsGameStart = useSetAtom(isGameStartedAtom);
  const setIsGameQuit = useSetAtom(isGameQuitAtom);
  const setGameResultModal = useSetAtom(gameResultModalAtom);
  const userList = useAtomValue(userListAtom);
  const gameWinner = useAtomValue(gameWinnerAtom);
  const navigate = useNavigate();

  const handlerGameQuit = () => {
    setIsPrivate(false);
    setIsGameStart(false);
    setIsLoading(false);
    setIsMatched(false);
    setIsGameQuit(true);
    setGameResultModal(false);
    navigate("/chat");
  };

  PressKey(["Escape"], () => {
    handlerGameQuit();
  });

  return (
    <>
      <div className="GameResultModalBG" />
      <div className="GameResultModal">
        <div className="GameResultModalTxt">{`${userList[gameWinner]?.userDisplayName} Win!`}</div>
        <div className="GameResultModalScore">{`${leftScore} : ${rightScore}`}</div>
        <button className="GameResultModalBtn" onClick={handlerGameQuit}>
          OK
        </button>
      </div>
    </>
  );
}
