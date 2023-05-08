import { useEffect, useState } from "react";
import BackGround from "../components/BackGround";
import "../components/GamePage/PingPong";
import PingPong from "../components/GamePage/PingPong";
import TopBar from "../components/TopBar";

import { useAtom } from "jotai";
import { isQueueAtom } from "../components/atom/GameAtom";

import { GameCoordinateAtom } from "../components/atom/GameAtom";
import * as game from '../socket/game.socket';


export default function GamePage() {
  const [showComponent, setShowComponent] = useState(true);
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
      <TopBar />
      {/* <div>{showComponent ? <Waiting /> : <PingPong />}</div> */}
      <PingPong />
    </BackGround>
  );
}
