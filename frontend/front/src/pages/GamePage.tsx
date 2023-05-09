import { useEffect, useState } from "react";
import BackGround from "../components/BackGround";
import "../components/GamePage/PingPong";
import PingPong from "../components/GamePage/PingPong";
import TopBar from "../components/TopBar";

import { useAtom } from "jotai";
import { isQueueAtom } from "../components/atom/GameAtom";

import { GameCoordinateAtom } from "../components/atom/GameAtom";
import * as game from "../socket/game.socket";

import { gameResultModalAtom } from "../components/atom/ModalAtom";
import GameResultModal from "../components/GamePage/GameResultModal";
import LadderBoard from "../components/GamePage/LadderBoard";
import * as chatAtom from "../components/atom/ChatAtom";

import { PressKey, AdminLogPrinter } from "../event/event.util";

export default function GamePage() {
  const [showComponent, setShowComponent] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [gameResultModal, setGameResultModal] = useAtom(gameResultModalAtom);

  const [isQueue, setIsQueue] = useAtom(isQueueAtom);

  const [coordinate, setCoordinate] = useAtom(GameCoordinateAtom);
  const [adminConsole, setAdminConsole] = useAtom(chatAtom.adminConsoleAtom);

  PressKey(["F4"], () => {
    setAdminConsole((prev) => !prev);
  });

  if (isQueue === false) {
    AdminLogPrinter(adminConsole, "gameSocket connect");
    game.gameSocket.connect();
    setIsQueue(true);
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
      {adminConsole === true
        ? <div>
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
        : ''
      }
      <TopBar />
      {isLoading ? <LadderBoard /> : <PingPong />}
      {gameResultModal ? <GameResultModal result={true} leftScore={5} rightScore={4} /> : null}
    </BackGround>
  );
}
