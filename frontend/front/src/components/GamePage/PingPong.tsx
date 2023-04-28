import "../../styles/BackGround.css";
import "../../styles/PingPong.css";

import React, { useEffect } from "react";
import { useAtom } from "jotai";

import { Game } from "./Pong";
import { GameCoordinateAtom, GameCoordinate } from "../atom/GameAtom";
import { PressKey } from "../../event/pressKey";

export default function PingPong() {
  const [coordinate, setCoordinate] = useAtom(GameCoordinateAtom);

  PressKey(["ArrowUp"], () => {
    let tmp = coordinate;
    tmp.leftY -= 10;
    setCoordinate(tmp);
    Game(coordinate);
  });
  PressKey(["ArrowDown"], () => {
    let tmp = coordinate;
    tmp.leftY += 10;
    setCoordinate(tmp);
    Game(coordinate);
  });

  useEffect(() => {
    Game(coordinate);
  }, []);

  return (
    <div className="QueueBackGround">
      <canvas id="pong" width={1150} height={600}></canvas>
    </div>
  );
}
