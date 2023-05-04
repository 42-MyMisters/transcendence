import "../../styles/BackGround.css";
import "../../styles/PingPong.css";

import React, { KeyboardEvent, useEffect } from "react";
import { useAtom } from "jotai";

import { Game } from "./Pong";
import { GameCoordinateAtom, GameCoordinate, GameCanvas } from "../atom/GameAtom";
import { PressKey } from "../../event/pressKey";

import * as game from "../../socket/game.socket";

import { useState, useRef } from "react";

export default function PingPong() {
  const [coordinate, setCoordinate] = useAtom(GameCoordinateAtom);
  const [upArrow, setUpArrow] = useState(false);
  const [downArrow, setDownArrow] = useState(false);
  // const [canvas, setCanvas] = useAtom(GameCanvas);
  const canvas = useRef<HTMLCanvasElement>(null);

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

  game.gameSocket.on(
    "join-game",
    ({ uid_left, p1, uid_right }: { uid_left: string; p1: number; uid_right: string }) => { }
  );

  const intersectionSize: number = 5;

  useEffect(() => {
    game.gameSocket.on(
      "graphic",
      ({ p1, ball_x, ball_y, p2 }: { p1: number; ball_x: number; ball_y: number; p2: number }) => {
        let temp = {
          leftY: p1 - 75,
          ballX: ball_x,
          ballY: ball_y,
          rightY: p2 - 75,
        };
        // drawIntersection(temp);
        // const leftGap = (coordinate.leftY - temp.leftY) / intersectionSize;
        // const rightGap = (coordinate.rightY - temp.rightY) / intersectionSize;
        // const ballGapX = (coordinate.ballX - temp.ballX) / intersectionSize;
        // const ballGapY = (coordinate.ballY - temp.ballY) / intersectionSize;
        // let tempCoordinate: GameCoordinate = {
        //   ...coordinate
        // }
        // for (let i = 0; i < intersectionSize; i++) {
        //   tempCoordinate.leftY += leftGap;
        //   tempCoordinate.rightY += rightGap;
        //   tempCoordinate.ballX += ballGapX;
        //   tempCoordinate.ballY += ballGapY;
        //   Game(tempCoordinate);
        // }

        // setCoordinate(temp);
        Game(temp, canvas);
      }
    );
    return () => {
      game.gameSocket.off("graphic");
    };
  }, []);

  useEffect(() => {
    Game({leftY: 225,
      ballX: 1150 / 2,
      ballY: 300,
      rightY: 225,}, canvas);
  }, []);

  // document.addEventListener('keydown', onKeyDown);
  // useEffect(() => {
  //   const handleKeyPress = (e: globalThis.KeyboardEvent) => {
  //     e.preventDefault();
  //     onKeyPress(e.key);
  //     removeEventListener('keydown', handleKeyPress);
  //     addEventListener('keyup', handleKeyUp);
  //   }

  //   const handleKeyUp = (e: globalThis.KeyboardEvent) => {
  //     e.preventDefault();
  //     onKeyRelease(e.key);
  //     removeEventListener('keyup', handleKeyUp);
  //     addEventListener('keydown', handleKeyPress);
  //   }

  //   const onKeyRelease = (key: string) => {
  //     if (key === 'ArrowUp') {
  //       game.emitUpRelease();
  //       console.log("up release");
  //     } else if (key === 'ArrowDown') {
  //       game.emitDownRelease();
  //       console.log("down release");
  //     }
  //   };
  //   const onKeyPress = (key: string) => {
  //     if (key === 'ArrowUp') {
  //       game.emitUpPress();
  //       console.log("up press");
  //     } else if (key === 'ArrowDown') {
  //       game.emitDownPress();
  //       console.log("down press");
  //     }
  //   };

  //   window.addEventListener('keydown', handleKeyPress);

  //   return () => {
  //     window.removeEventListener('keydown', handleKeyPress);
  //     window.removeEventListener('keyup', handleKeyUp);
  //   }
  // }, []);

  useEffect(() => {
    function handleKeyPress(event: globalThis.KeyboardEvent) {
      // event.preventDefault();
      if (event.code === "ArrowUp") {
        if (!upArrow) {
          setUpArrow(true);
          game.emitUpPress();
          console.log("up press");
        }
      } else if (event.code === "ArrowDown") {
        if (!downArrow) {
          setDownArrow(true);
          game.emitDownPress();
          console.log("down press");
        }
      }
    }

    function handleKeyRelease(event: globalThis.KeyboardEvent) {
      // event.preventDefault();
      if (event.code === "ArrowUp") {
        if (upArrow) {
          setUpArrow(false);
          game.emitUpRelease();
          console.log("up release");
        }
      } else if (event.code === "ArrowDown") {
        if (downArrow) {
          setDownArrow(false);
          game.emitDownRelease();
          console.log("down release");
        }
      }
    }
    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("keyup", handleKeyRelease);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("keyup", handleKeyRelease);
    };
  }, [upArrow, downArrow]);

  return (
    <div className="QueueBackGround">
      <canvas ref={canvas} id="pong" width={1150} height={600}></canvas>
    </div>
  );
}
