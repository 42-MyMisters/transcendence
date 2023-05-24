import { useEffect, useState } from "react";
import BackGround from "../components/BackGround";
import "../components/GamePage/PingPong";
import PingPong from "../components/GamePage/PingPong";
import TopBar from "../components/TopBar";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  isGameStartedAtom,
  isLoadingAtom,
  isMatchedAtom,
  isPrivateAtom,
  isGameQuitAtom,
  gameInviteInfoAtom,
  gameSocketAtom,
  gameModeAtom,
  // isP1Atom,
  gameWinnerAtom,
  p1IdAtom,
  p2IdAtom,
  gamePlayerAtom,
  GamePlayer,
  GameMode,
  gameModeForDisplayAtom,
} from "../components/atom/GameAtom";

import * as chatSocket from "../socket/chat.socket";
import * as chatAtom from "../components/atom/ChatAtom";
import { gameResultModalAtom } from "../components/atom/ModalAtom";
import GameResultModal from "../components/GamePage/GameResultModal";
import LadderBoard from "../components/GamePage/LadderBoard";

import Waiting from "../components/GamePage/Waiting";
import { AdminLogPrinter, PressKey } from "../event/event.util";
import { io, Socket } from 'socket.io-client';
import { UserAtom } from "../components/atom/UserAtom";
import { GameType } from "../socket/game.dto";
import { player1, player2 } from "../components/GamePage/GameInfo";

export default function GamePage() {
  const [showComponent, setShowComponent] = useState(true);
  const [gameResultModal, setGameResultModal] = useAtom(gameResultModalAtom);

  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);
  const [isMatched, setIsMatched] = useAtom(isMatchedAtom);
  const [isPrivate, setIsPrivate] = useAtom(isPrivateAtom);
  const [isGameStart, setIsGameStart] = useAtom(isGameStartedAtom);
  const setIsGameQuit = useSetAtom(isGameQuitAtom);
  const [gameInviteInfo, setGameInviteInfo] = useAtom(gameInviteInfoAtom);
  const [gameMode, setGameMode] = useAtom(gameModeAtom);

  const [adminConsole, setAdminConsole] = useAtom(chatAtom.adminConsoleAtom);

  const [userInfo, setUserInfo] = useAtom(UserAtom);

  const [gameSocket, setGameSocket] = useAtom(gameSocketAtom);

  const [gamePlayer, setGamePlayer] = useAtom(gamePlayerAtom);

  const [gameModeForDisplay, setGameModeForDisplay] = useAtom(gameModeForDisplayAtom);
  // const [isP1, setIsP1] = useAtom(isP1Atom);


  const [p1Id, setP1Id] = useAtom(p1IdAtom);
  const [p2Id, setP2Id] = useAtom(p2IdAtom);

  const userList = useAtomValue(chatAtom.userListAtom);
  const gameWinner = useAtomValue(gameWinnerAtom);

  class socketAuth {
    token: string | null;
    type: GameType;
    invite?: number;
    observ?: number;
    constructor(inviteInfo: { gameType: string, userId: number }) {
      this.token = localStorage.getItem("refreshToken");
      this.type = isPrivate ? GameType.PRIVATE : GameType.PUBLIC;
      if (inviteInfo.gameType === 'invite') {
        this.invite = inviteInfo.userId;
      } else if (inviteInfo.gameType === 'observe') {
        this.observ = inviteInfo.userId;
      }
    }
  }

  PressKey(["F4"], () => {
    setAdminConsole((prev) => !prev);
  });

  const clearState = () => {
    // setIsGameStart(false);
    setIsLoading(false);
    setIsMatched(false);
    setIsGameQuit(true);
    setGamePlayer(GamePlayer.undefined);
    setGameMode('normal');
  };

  useEffect(() => {
    AdminLogPrinter(adminConsole, `gameSocket connection`);
    const auth = new socketAuth(gameInviteInfo);
    gameSocket.auth = auth;
    const socket = gameSocket;
    socket.connect();
    setGameSocket(socket);
    setGameInviteInfo({ gameType: 'queue', userId: -1 });
    setIsGameQuit(false);
    if (!isGameStart) {
      setIsLoading(true);
    } else {
      setGamePlayer(GamePlayer.observer);
    }
    if (isPrivate) {
      setP1Id(userInfo.uid);
    }
    return () => {
      gameSocket.disconnect();
      clearState();
    };
  }, []);

  const connectionEventHandler = () => {
    if (gameSocket.connected) {
      //This attribute describes whether the socket is currently connected to the server.
      if (gameSocket.recovered) {
        // any missed packets will be received
      } else {
        // new or unrecoverable session
        AdminLogPrinter(adminConsole, "gameSocket connected");
      }
    }
  };

  //https://socket.io/docs/v4/client-socket-instance/#disconnect
  const disconnectionEventHandler = (reason: string) => {
    if (reason === "io server disconnect") {
    } else if (reason === "io client disconnect") {
      setIsGameStart(false);
    }
    console.log(`gameSocket end`, reason);
    clearState();
    AdminLogPrinter(adminConsole, "gameSocket disconnected");
  };

  const gameStartEventHandler = ({ gameMode, p1, p2 }: { gameMode: GameMode, p1: number, p2: number }) => {
    AdminLogPrinter(adminConsole, "game start");
    setGameModeForDisplay(gameMode);
    setIsLoading(false);
    setIsMatched(false);
    setIsGameStart(true);
  };

  const matchEventHandler = ({ p1, p2 }: { p1: number, p2: number }) => {
    AdminLogPrinter(adminConsole, "matched");
    if (p1 === userInfo.uid) {
      // setIsP1(true);
      setGamePlayer(GamePlayer.player1);
      setP1Id(p1);
      setP2Id(p2);
      player1.uid = p1;
      player2.uid = p2;
      player1.name = userList[p1]?.userDisplayName || 'Norminette';
      player2.name = userList[p2]?.userDisplayName || 'LoremIpsum';
    } else if (p2 === userInfo.uid) {
      setGamePlayer(GamePlayer.player2);
      setP1Id(p2);
      setP2Id(p1);
      player1.uid = p2;
      player2.uid = p1;
      player1.name = userList[p2]?.userDisplayName || 'Norminette';
      player2.name = userList[p1]?.userDisplayName || 'LoremIpsum';
    } else {
      setGamePlayer(GamePlayer.observer);
      setP1Id(p1);
      setP2Id(p2);
      player1.uid = p1;
      player2.uid = p2;
      player1.name = userList[p1]?.userDisplayName || 'Norminette';
      player2.name = userList[p2]?.userDisplayName || 'LoremIpsum';
    }
    setIsMatched(true);
  };

  const observerEventHandler = ({ gameMode, p1, p2 }: { gameMode: GameMode, p1: number, p2: number }) => {
    AdminLogPrinter(adminConsole, "observer");
    setGameModeForDisplay(gameMode);
    setP1Id(p1);
    setP2Id(p2);
    player1.uid = p1;
    player2.uid = p2;
    player1.name = userList[p1]?.userDisplayName || 'Norminette';
    player2.name = userList[p2]?.userDisplayName || 'LoremIpsum';
  };

  useEffect(() => {
    gameSocket.on("observer", observerEventHandler);
    return () => {
      gameSocket.off("observer", observerEventHandler);
    }
  }, [gameSocket]);

  useEffect(() => {
    gameSocket.on("connect", connectionEventHandler);
    gameSocket.on("gameStart", gameStartEventHandler);
    return () => {
      gameSocket.off("connect", connectionEventHandler);
      gameSocket.off("gameStart", gameStartEventHandler);
    };
  }, [isGameStart, gameSocket]);

  useEffect(() => {
    gameSocket.on("disconnect", disconnectionEventHandler);
    return () => {
      gameSocket.off("disconnect", disconnectionEventHandler);
    };
  }, [isPrivate, isGameStart, gameSocket]);

  useEffect(() => {
    gameSocket.on("matched", matchEventHandler);
    return () => {
      gameSocket.off("matched", matchEventHandler);
    }
  }, [isMatched, gameSocket]);

  return (
    <BackGround>
      {adminConsole ? (
        <div>
          <button
            onClick={() => {
              const loading = !isLoading;
              setIsLoading(loading);
              setIsGameStart(!loading);
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
          <button
            onClick={() => {
              console.log(`isPrivate: ${isPrivate}`);
            }}
          >
            isPrivate
          </button>
        </div>
      ) : (
        ""
      )}
      <TopBar />
      {
        isLoading
          ? (isPrivate
            ? (<Waiting />)
            : (isMatched
              ? (<Waiting />)
              : (<LadderBoard />)
            )
          )
          : isGameStart
            ? (<PingPong />)
            : ''
      }
      {gameResultModal ? <GameResultModal leftScore={player1.score} rightScore={player2.score} /> : null}
    </BackGround>
  );
}
