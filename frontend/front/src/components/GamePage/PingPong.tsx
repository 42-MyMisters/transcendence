import "../../styles/BackGround.css";
import "../../styles/PingPong.css";

import React, { useEffect } from "react";
import { game } from "./Pong";

export default function PingPong() {
  useEffect(() => {
    game();
  }, []);

  return (
    <div className="QueueBackGround">
      <canvas className="pong" width={1150} height={600}></canvas>
    </div>
  );
}
