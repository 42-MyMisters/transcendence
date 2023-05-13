import { useEffect, useState } from "react";
import BackGround from "../components/BackGround";
import "../components/GamePage/PingPong";
import PingPong from "../components/GamePage/PingPong";
import TopBar from "../components/TopBar";

import { useAtom } from "jotai";
import { isGameStartedAtom, isLoadingAtom, isPrivateAtom, serverClientTimeDiffAtom } from "../components/atom/GameAtom";

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

  const [serverClientTimeDiff, setServerClientTimeDiff] = useAtom(serverClientTimeDiffAtom);

  let pingInterval: NodeJS.Timer;

  // 1 sec delay for init value 
  let pingRTTmin: number = 2000;
  
  PressKey(["F4"], () => {
    setAdminConsole((prev) => !prev);
  });

  if (isLoading === false) {
    AdminLogPrinter(adminConsole, "gameSocket connection");
    game.gameSocket.connect();
    setIsLoading(true);
  }

  const connectionEventHandler = () => {
    if (game.gameSocket.connected) {
      //This attribute describes whether the socket is currently connected to the server.
      if (game.gameSocket.recovered) {
        // any missed packets will be received
      } else {
        // new or unrecoverable session
        AdminLogPrinter(adminConsole, "gameSocket connected");
        pingInterval = setInterval(pingEvent, 1000);
      }
    }
  }

  //https://socket.io/docs/v4/client-socket-instance/#disconnect
  const disconnectionEventHandler = (reason: string) => {
    if (reason === "io server disconnect") {
    }
    clearInterval(pingInterval);
    // setIsQueue(false);
    setIsLoading(false);
    setIsPrivate(false);
    AdminLogPrinter(adminConsole, "gameSocket disconnected");
  }
  
  const pingEvent = () => {
    const curTime = Date.now();
    const pingEventHandler = (serverTime: number) => {
      const now = Date.now();
      const pingRTT = now - curTime;
      AdminLogPrinter(adminConsole, `pingRTT: ${pingRTT}ms`);
      if (pingRTTmin > pingRTT) {
        pingRTTmin = pingRTT;
        const adjServerTime = serverTime + pingRTTmin / 2;
        AdminLogPrinter(adminConsole, `updated serverClientTimeDiff: ${serverClientTimeDiff}ms`);
        setServerClientTimeDiff(now - adjServerTime);
        AdminLogPrinter(adminConsole, `updated serverClientTimeDiff: ${serverClientTimeDiff}ms`);
      }
      AdminLogPrinter(adminConsole, `pingRTTmin: ${pingRTTmin}ms`);
    }
    game.gameSocket.emit('ping', pingEventHandler);
    return () => {
      game.gameSocket.off('ping', pingEventHandler);
    }
  }

  const startEventHandler = () => {
    AdminLogPrinter(adminConsole, "game start");
    setIsLoading(false);
    setIsGameStart(true);
    AdminLogPrinter(adminConsole, `isLoading: ${isLoading}, isPrivate: ${isPrivate}, isGameStart: ${isGameStart}`);
  }

  useEffect(() => {
    game.gameSocket.on("connect", connectionEventHandler);
    game.gameSocket.on("disconnect", disconnectionEventHandler);
    game.gameSocket.on("gameStart", startEventHandler);
    // game.gameSocket.on("isQueue", queueEventHandler);
    // game.gameSocket.on("isLoading", loadingEventHandler);
    return () => {
      game.gameSocket.off("connect", connectionEventHandler);
      game.gameSocket.off("disconnect", disconnectionEventHandler);
      game.gameSocket.off("gameStart", startEventHandler);
      // game.gameSocket.off("isQueue", queueEventHandler);
      // game.gameSocket.off("isLoading", loadingEventHandler);
    }
  }, [isLoading, isPrivate, isGameStart]);

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
