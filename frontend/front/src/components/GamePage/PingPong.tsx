import "../../styles/BackGround.css";
import "../../styles/PingPong.css";

import React, { KeyboardEvent, useEffect } from "react";
import { useAtom } from "jotai";

import { Game } from "./Pong";
import { GameCoordinateAtom, GameCoordinate, GameCanvas } from "../atom/GameAtom";
import { PressKey } from "../../event/pressKey";

import * as game from "../../socket/game.socket";

import { useState, useRef } from "react";
import { time } from "console";
import { socket } from "../../socket/chat.socket";

export default function PingPong() {
  let ping: number;
  const [coordinate, setCoordinate] = useAtom(GameCoordinateAtom);
  const [upArrow, setUpArrow] = useState(false);
  const [downArrow, setDownArrow] = useState(false);
  // const [canvas, setCanvas] = useAtom(GameCanvas);
  const canvas = useRef<HTMLCanvasElement>(null);

  // PressKey(["ArrowUp"], () => {
  //   let tmp = coordinate;
  //   tmp.leftY -= 10;
  //   setCoordinate(tmp);
  //   Game(coordinate, canvas, setCanvas});
  // });

  // PressKey(["ArrowDown"], () => {
  //   let tmp = coordinate;
  //   tmp.leftY += 10;
  //   setCoordinate(tmp);
  //   Game(coordinate, canvas, setCanvas});
  // });

  let pingInterval: NodeJS.Timer;
  let pingTime: number;
  let lastCoordTime: number;

  game.gameSocket.on("connect", () => {
    if (game.gameSocket.connected) {
      //This attribute describes whether the socket is currently connected to the server.
      if (game.gameSocket.recovered) {
        // any missed packets will be received
      } else {
        // new or unrecoverable session
        console.log("gameSocket connected : " + game.gameSocket.id);
        pingInterval = setInterval(() => {
          const curTime = Date.now();
          game.gameSocket.emit('ping', (pong:boolean) => {
            if (pong) {
              pingTime = Date.now() - curTime;
              // console.log(`ping: ${Date.now() - curTime}`);
            }
          });
        }, 1000);
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
    clearInterval(pingInterval);
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
    ({ uid_left, p1, uid_right }: { uid_left: string; p1: number; uid_right: string }) => {}
  );

  const intersectionSize: number = 5;

  useEffect(() => {
    game.gameSocket.on(
      "graphic",
      (gameCoord: GameCoordinate) => {
        let temp = gameCoord;
        setCoordinate(temp);
      })
      // return () => {
      //   game.gameSocket.off("graphic");
      // };
    }, []);



  requestAnimationFrame(() => Game(coordinate, canvas));

  useEffect(() => {
    Game(coordinate, canvas);
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
