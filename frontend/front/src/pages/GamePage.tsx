import React, { useState, useEffect } from "react";
import Navigator from "../components/Navigator";
import "../components/GamePage/PingPong";
import PingPong from "../components/GamePage/PingPong";
import Waiting from "../components/GamePage/Waiting";
import BackGround from "../components/BackGround";
import TopBar from "../components/TopBar";

import { useAtom } from "jotai";
import { isQueueAtom } from "../components/atom/GameAtom";

import { PressKey } from "../event/pressKey";
import * as game from "../socket/game.socket";
import { GameCoordinateAtom, GameCoordinate } from "../components/atom/GameAtom";

import { Game } from "../components/GamePage/Pong";
import GameResultModal from "../components/GamePage/GameResultModal";
import LadderBoard from "../components/GamePage/LadderBoard";
import { gameResultModalAtom } from "../components/atom/ModalAtom";

export default function GamePage() {
  const [showComponent, setShowComponent] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [gameResultModal, setGameResultModal] = useAtom(gameResultModalAtom);

  const [isQueue, setIsQueue] = useAtom(isQueueAtom);

  const [coordinate, setCoordinate] = useAtom(GameCoordinateAtom);

  if (isQueue === false) {
    console.log("gameSocket connect");
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

      <TopBar />
      {isLoading ? <LadderBoard /> : <PingPong />}
      {gameResultModal ? <GameResultModal result={true} leftScore={5} rightScore={4} /> : null}
    </BackGround>
  );
}
