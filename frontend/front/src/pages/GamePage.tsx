import { useEffect, useState } from "react";
import BackGround from "../components/BackGround";
import "../components/GamePage/PingPong";
import PingPong from "../components/GamePage/PingPong";
import TopBar from "../components/TopBar";

import { useAtom } from "jotai";
import {
  isGameStartedAtom,
  isLoadingAtom,
  isMatchedAtom,
  isPrivateAtom,
} from "../components/atom/GameAtom";

import * as chatAtom from "../components/atom/ChatAtom";
import { gameResultModalAtom } from "../components/atom/ModalAtom";
import GameResultModal from "../components/GamePage/GameResultModal";
import LadderBoard from "../components/GamePage/LadderBoard";

import Waiting from "../components/GamePage/Waiting";
import { AdminLogPrinter, PressKey } from "../event/event.util";
import { io, Socket } from 'socket.io-client';
import { UserAtom } from "../components/atom/UserAtom";

export default function GamePage() {
  const [showComponent, setShowComponent] = useState(true);
  const [gameResultModal, setGameResultModal] = useAtom(gameResultModalAtom);

  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);
  const [isMatched, setIsMatched] = useAtom(isMatchedAtom);
  const [isPrivate, setIsPrivate] = useAtom(isPrivateAtom);
  const [isGameStart, setIsGameStart] = useAtom(isGameStartedAtom);

  const [adminConsole, setAdminConsole] = useAtom(chatAtom.adminConsoleAtom);

  const [userInfo, setUserInfo] = useAtom(UserAtom);
  
  
  let isP1: boolean;
  
  class socketAuth {
    token:string | null;
    data?:number;
    observ?:number;
    invite?:number;
    constructor() {
      this.token = null;
    }
  }
  
  let auth: socketAuth = new socketAuth();
  auth.token = localStorage.getItem("refreshToken");

  // const URL = process.env.REACT_APP_API_URL;
  const URL = "https://localhost";
  const NameSpace = "/game";

  let gameSocket: Socket = io(`${URL}${NameSpace}`, {
    auth: auth,
    autoConnect: false,
    transports: ["polling", "websocket"],
    secure: true,
    upgrade: true,
  });

  PressKey(["F4"], () => {
    setAdminConsole((prev) => !prev);
  });

  useEffect(() => {
    if (isLoading === false) {
      AdminLogPrinter(adminConsole, `gameSocket connection`);
      gameSocket.connect();
      setIsLoading(true);
      return () => {
        gameSocket!.disconnect();
      };
    }
  }, []);

  const connectionEventHandler = () => {
    if (gameSocket!.connected) {
      //This attribute describes whether the socket is currently connected to the server.
      if (gameSocket!.recovered) {
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

  const gameStartEventHandler = () => {
    AdminLogPrinter(adminConsole, "game start");
    if (isLoading) {
      setIsLoading(false);
    }
    if (!isGameStart) {
      setIsGameStart(true);
    }
  };

  const matchEventHandler = (playerInfo: { p1: number, p2: number }) => {
    AdminLogPrinter(adminConsole, "matched");
    if (playerInfo.p1 === userInfo.uid) {
      isP1 = true;
    } else {
      isP1 = false;
    }
    if (!isMatched) {
      setIsMatched(true);
    }
  };

  const observerHandler = () => {
    AdminLogPrinter(adminConsole, "observer");
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
      `useeffect: isLoading: ${isLoading}, isPrivate: ${isPrivate}, isMatched: ${isMatched}, isGameStart: ${isGameStart}`
    );
  }, [isLoading, isPrivate, isGameStart, isMatched]);

  useEffect(() => {
    // if (isLoading && gameSocket !== null) {
    gameSocket.on("connect", connectionEventHandler);
    console.log("matchEvent on");
    gameSocket.on("matched", matchEventHandler);
    gameSocket.on("disconnect", disconnectionEventHandler);
    gameSocket.on("gameStart", gameStartEventHandler);
    return () => {
      gameSocket.off("connect", connectionEventHandler);
      gameSocket.off("matched", matchEventHandler);
      gameSocket.off("disconnect", disconnectionEventHandler);
      gameSocket.off("gameStart", gameStartEventHandler);
    };
    // }
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
        ) : ( <Waiting /> )
        // (
        //   isMatched ? (
        //     <Waiting />
        //   ) : (
        //     <LadderBoard />
        //   )
        // )
      ) : isGameStart ? (
        <PingPong gameSocket={gameSocket!} />
      ) : (
        <Waiting />
      )}
      {gameResultModal ? <GameResultModal result={true} leftScore={5} rightScore={4} /> : null}
    </BackGround>
  );
}
