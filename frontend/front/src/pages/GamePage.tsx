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
import * as game from '../socket/game.socket';
import { GameCoordinateAtom, GameCoordinate } from "../components/atom/GameAtom";

import { Game } from "../components/GamePage/Pong";

export default function GamePage() {
  const [showComponent, setShowComponent] = useState(true);
  const [isQueue, setIsQueue] = useAtom(isQueueAtom);

  const [coordinate, setCoordinate] = useAtom(GameCoordinateAtom);

  if (isQueue === false) {
    console.log("gameSocket connect");
    game.gameSocket.connect();
    setIsQueue(true);
  }

  // // catch all incoming events
  // game.gameSocket.onAny((eventName, ...args) => {
  //   console.log("incoming ", eventName, args);
  // });

  // // catch all outgoing events
  // game.gameSocket.prependAny((eventName, ...args) => {
  //   console.log("outgoing ", eventName, args);
  // });

  // game.gameSocket.on("connect", () => {
  //   if (game.gameSocket.connected) {
  //     //This attribute describes whether the socket is currently connected to the server.
  //     if (game.gameSocket.recovered) {
  //       // any missed packets will be received
  //     } else {
  //       // new or unrecoverable session
  //       console.log("gameSocket connected : " + game.gameSocket.id);
  //     }
  //   }
  // });

  // //https://socket.io/docs/v4/client-socket-instance/#disconnect
  // game.gameSocket.on("disconnect", (reason) => {
  //   /**
  //    *  BAD, will throw an error
  //    *  gameSocket.emit("disconnect");
  //   */
  //   if (reason === "io server disconnect") {
  //     // the disconnection was initiated by the server, you need to reconnect manually
  //   }
  //   // else the socket will automatically try to reconnect
  //   console.log("gameSocket disconnected");
  // });

  // // the connection is denied by the server in a middleware function
  // game.gameSocket.on("connect_error", (err) => {
  //   if (err.message === "unauthorized") {
  //     // handle each case
  //   }
  //   console.log(err.message); // prints the message associated with the error
  // });

  // game.gameSocket.on('join-game', ({
  //   uid_left,
  //   p1,
  //   uid_right
  // }: {
  //   uid_left: string;
  //   p1: number;
  //   uid_right: string;
  // }) => {

  // });

  // game.gameSocket.on('graphic', ({
  //   p1,
  //   ball_x,
  //   ball_y,
  //   p2
  // }: {
  //   p1: number;
  //   ball_x: number;
  //   ball_y: number;
  //   p2: number;
  // }) => {

  //   Game(coordinate);

  // });

  // PressKey(["ArrowUp"], () => {
  //   let tmp = coordinate;
  //   tmp.leftY -= 10;
  //   setCoordinate(tmp);
  //   Game(coordinate);
  // });

  // PressKey(["ArrowDown"], () => {
  //   let tmp = coordinate;
  //   tmp.leftY += 10;
  //   setCoordinate(tmp);
  //   Game(coordinate);
  // });


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
