import React from "react";
import Navigator from "../components/Navigator";
import "../components/GamePage/PingPong";
import PingPong from "../components/GamePage/PingPong";

export default function GamePage() {
  return (
    <>
      <Navigator />
      <PingPong />
    </>
  );
}
