import React, { useState, useEffect } from "react";
import Navigator from "../components/Navigator";
import "../components/GamePage/PingPong";
import PingPong from "../components/GamePage/PingPong";
import Waiting from "../components/GamePage/Waiting";
import BackGround from "../components/BackGround";
import TopBar from "../components/TopBar";


export default function GamePage() {
  const [showComponent, setShowComponent] = useState(true);

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
