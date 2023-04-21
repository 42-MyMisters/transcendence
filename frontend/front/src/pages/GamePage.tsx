import React, { useState, useEffect } from "react";
import Navigator from "../components/Navigator";
import "../components/GamePage/PingPong";
import PingPong from "../components/GamePage/PingPong";
import Waiting from "../components/GamePage/Waiting";
import BackGround from "../components/BackGround";
import TopBar from "../components/TopBar";

import { useAtom } from "jotai";
import { hasLoginAtom } from '../components/atom/SocketAtom';
import { useNavigate } from 'react-router-dom';

export default function GamePage() {
  const [showComponent, setShowComponent] = useState(true);
  const [hasLogin,] = useAtom(hasLoginAtom);
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasLogin) {
      navigate("/");
    }
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
