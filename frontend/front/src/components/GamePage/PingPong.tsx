import "../../styles/BackGround.css";
import "../../styles/PingPong.css";

import React, { useEffect } from "react";
import { useAtom } from "jotai";

import { Game } from "./Pong";
import { GameCoordinateAtom, GameCoordinate } from "../atom/GameAtom";
import { PressKey } from "../../event/pressKey";

import * as game from '../../socket/game.socket';

export default function PingPong() {
  const [coordinate, setCoordinate] = useAtom(GameCoordinateAtom);

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

  // catch all incoming events
  game.gameSocket.onAny((eventName, ...args) => {
    console.log("incoming ", eventName, args);
  });

  // catch all outgoing events
  game.gameSocket.prependAny((eventName, ...args) => {
    console.log("outgoing ", eventName, args);
  });

  game.gameSocket.on("connect", () => {
    if (game.gameSocket.connected) {
      //This attribute describes whether the socket is currently connected to the server.
      if (game.gameSocket.recovered) {
        // any missed packets will be received
      } else {
        // new or unrecoverable session
        console.log("gameSocket connected : " + game.gameSocket.id);
      }
    }
  });

  //https://socket.io/docs/v4/client-socket-instance/#disconnect
  game.gameSocket.on("disconnect", (reason) => {
    /**
     *  BAD, will throw an error
     *  gameSocket.emit("disconnect");
    */
    if (reason === "io server disconnect") {
      // the disconnection was initiated by the server, you need to reconnect manually
    }
    // else the socket will automatically try to reconnect
    console.log("gameSocket disconnected");
  });

  // the connection is denied by the server in a middleware function
  game.gameSocket.on("connect_error", (err) => {
    if (err.message === "unauthorized") {
      // handle each case
    }
    console.log(err.message); // prints the message associated with the error
  });

  game.gameSocket.on('join-game', ({
    uid_left,
    p1,
    uid_right
  }: {
    uid_left: string;
    p1: number;
    uid_right: string;
  }) => {

  });

  useEffect(() => {
    game.gameSocket.on('graphic', ({
      p1,
      ball_x,
      ball_y,
      p2
    }: {
      p1: number;
      ball_x: number;
      ball_y: number;
      p2: number;
    }) => {
      let temp = coordinate;
      temp = {
        leftY: p1,
        ballX: ball_x,
        ballY: ball_y,
        rightY: p2
      }
      setCoordinate(temp);
      Game(coordinate);
    });
    return () => {
      game.gameSocket.off('graphic');
    };
  }, [coordinate]);

  useEffect(() => {
    Game(coordinate);
  }, []);

  // document.addEventListener('keydown', onKeyDown);
  window.addEventListener('keydown', e => {
    e.preventDefault();
    if (e.key === 'ArrowUp') {
      game.emitUpPress();
      console.log("up press");
    } else if (e.key === 'ArrowDown') {
      game.emitDownPress();
      console.log("down press");
    }
  });

  window.addEventListener('keyup', e => {
    e.preventDefault();
    if (e.key === 'ArrowUp') {
      game.emitUpRelease();
      console.log("up release");
    } else if (e.key === 'ArrowDown') {
      game.emitDownRelease();
      console.log("down release");
    }
  });

  return (
    <div className="QueueBackGround">
      <canvas id="pong" width={1150} height={600}></canvas>
    </div>
  );
}
