import { useEffect, useState } from "react";
import BackGround from "../components/BackGround";
import "../components/GamePage/PingPong";
import PingPong from "../components/GamePage/PingPong";
import TopBar from "../components/TopBar";

import { useAtom } from "jotai";
import {
  isGameStartedAtom,
  isLoadingAtom,
  isPrivateAtom,
  serverClientTimeDiffAtom,
} from "../components/atom/GameAtom";

import * as game from "../socket/game.socket";

import * as chatAtom from "../components/atom/ChatAtom";
import { gameResultModalAtom } from "../components/atom/ModalAtom";
import GameResultModal from "../components/GamePage/GameResultModal";
import LadderBoard from "../components/GamePage/LadderBoard";

import Waiting from "../components/GamePage/Waiting";
import { AdminLogPrinter, PressKey } from "../event/event.util";

export default function GamePage() {
  const [showComponent, setShowComponent] = useState(true);
  const [gameResultModal, setGameResultModal] = useAtom(gameResultModalAtom);

  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);
  const [isPrivate, setIsPrivate] = useAtom(isPrivateAtom);
  const [isGameStart, setIsGameStart] = useAtom(isGameStartedAtom);

  const [adminConsole, setAdminConsole] = useAtom(chatAtom.adminConsoleAtom);

  PressKey(["F4"], () => {
    setAdminConsole((prev) => !prev);
  });

  useEffect(() => {
    if (isLoading === false) {
      AdminLogPrinter(adminConsole, `gameSocket connection`);
      game.gameSocket.connect();
      setIsLoading(true);
      return () => {
        game.gameSocket.disconnect();
      };
    }
  }, []);

  const connectionEventHandler = () => {
    if (game.gameSocket.connected) {
      //This attribute describes whether the socket is currently connected to the server.
      if (game.gameSocket.recovered) {
        // any missed packets will be received
      } else {
        // new or unrecoverable session
        AdminLogPrinter(adminConsole, "gameSocket connected");
        // pingInterval = setInterval(pingEvent, 1000);
      }
    }
  };

  //https://socket.io/docs/v4/client-socket-instance/#disconnect
  const disconnectionEventHandler = (reason: string) => {
    if (reason === "io server disconnect") {
    }
    if (isLoading) {
      setIsLoading(false);
    }
    if (isPrivate) {
      setIsPrivate(false);
    }
    AdminLogPrinter(adminConsole, "gameSocket disconnected");
  };

  const startEventHandler = () => {
    AdminLogPrinter(adminConsole, "game start");
    if (isLoading) {
      setIsLoading(false);
    }
    if (!isGameStart) {
      setIsGameStart(true);
    }
  };

  useEffect(() => {
    AdminLogPrinter(
      adminConsole,
      `useeffect: isLoading: ${isLoading}, isPrivate: ${isPrivate}, isGameStart: ${isGameStart}`
    );
  }, [isLoading, isPrivate, isGameStart]);

  useEffect(() => {
    if (isLoading) {
      game.gameSocket.on("connect", connectionEventHandler);
      game.gameSocket.on("disconnect", disconnectionEventHandler);
      game.gameSocket.on("gameStart", startEventHandler);
      return () => {
        game.gameSocket.off("connect", connectionEventHandler);
        game.gameSocket.off("disconnect", disconnectionEventHandler);
        game.gameSocket.off("gameStart", startEventHandler);
      };
    }
  }, [isLoading]);

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
