import { useEffect, useState } from "react";
import BackGround from "../components/BackGround";
import "../components/GamePage/PingPong";
import PingPong from "../components/GamePage/PingPong";
import TopBar from "../components/TopBar";

import { useAtom } from "jotai";
import { isGameStartedAtom, isLoadingAtom, isPrivateAtom } from "../components/atom/GameAtom";

import * as game from "../socket/game.socket";

import { gameResultModalAtom, isLoadingAtom } from "../components/atom/ModalAtom";
import GameResultModal from "../components/GamePage/GameResultModal";
import LadderBoard from "../components/GamePage/LadderBoard";
import * as chatAtom from "../components/atom/ChatAtom";

import { PressKey, AdminLogPrinter } from "../event/event.util";
import Waiting from "../components/GamePage/Waiting";

export default function GamePage() {
  const [showComponent, setShowComponent] = useState(true);
<<<<<<< HEAD
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);
=======
>>>>>>> 4cb979b3131498bdba0420c89cc4a4b32e4a7fac
  const [gameResultModal, setGameResultModal] = useAtom(gameResultModalAtom);

  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);
  const [isPrivate, setIsPrivate] = useAtom(isPrivateAtom);
  const [isGameStart, setIsGameStart] = useAtom(isGameStartedAtom);

  const [adminConsole, setAdminConsole] = useAtom(chatAtom.adminConsoleAtom);

  PressKey(["F4"], () => {
    setAdminConsole((prev) => !prev);
  });

  if (isLoading === false) {
    AdminLogPrinter(adminConsole, "gameSocket connect");
    game.gameSocket.connect();
    setIsLoading(true);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowComponent(false);
    }, 5000);
    //   return () => {
    //     clearTimeout(timer);
    //   };
    // }, []);
  }, []);

  return (
    <BackGround>
      {adminConsole ? (
        <div>
          <button
            onClick={() => {
              const loading = !isLoading;
              setIsLoading(loading);
            }}
          >
            LadderRanking
          </button>
          <button
            onClick={() => {
              const gameOverModal = !gameResultModal;
              setGameResultModal(gameOverModal);
            }}
          >
            GameOver
          </button>
        </div>
      ) : (
        ""
      )}
      <TopBar />
      {isLoading ? (
        isPrivate ? (
          <Waiting />
        ) : (
          <LadderBoard />
        )
      ) : isGameStart ? (
        <PingPong />
      ) : (
        <Waiting />
      )}
      {gameResultModal ? <GameResultModal result={true} leftScore={5} rightScore={4} /> : null}
    </BackGround>
  );
}
