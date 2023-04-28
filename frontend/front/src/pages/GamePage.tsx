import React, { useState, useEffect } from "react";
import Navigator from "../components/Navigator";
import "../components/GamePage/PingPong";
import PingPong from "../components/GamePage/PingPong";
import Waiting from "../components/GamePage/Waiting";
import BackGround from "../components/BackGround";
import TopBar from "../components/TopBar";

import { useAtom } from "jotai";
import { isQueueAtom } from "../components/atom/GameAtom";
import * as gameSocket from '../socket/game.socket';

export default function GamePage() {
  const [showComponent, setShowComponent] = useState(true);
  const [isQueue, setIsQueue] = useAtom(isQueueAtom);

  if (isQueue === false) {
    console.log("gameSocket connect");
    gameSocket.gameSocket.connect();
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
      <TopBar />
      <div>{showComponent ? <Waiting /> : <PingPong />}</div>
    </BackGround>
  );
}
