import "../../styles/BackGround.css";
import "../../styles/PingPong.css";

import React, { KeyboardEvent, useEffect } from "react";
import { useAtom } from "jotai";

import { Game } from "./Pong";
import { GameCoordinateAtom, GameCoordinate, GameCanvas, lastUpdate } from "../atom/GameAtom";
import { PressKey } from "../../event/pressKey";

import * as game from "../../socket/game.socket";

import { useState, useRef } from "react";
import { time } from "console";
import { socket } from "../../socket/chat.socket";
import { ball, HEIGHT, me, opponent, paddle, WIDTH } from "./GameInfo";

export const enum Direction {
  NONE = 0, // => hmm...
  UP = 1,
  DOWN = 2,
  LEFT = 3,
  RIGHT = 4
}

export const enum Hit {
  PADDLE = 1,
  WALL = 0,
}

export interface paddleInfo {
  paddle1YUp: boolean,
  paddle1YDown: boolean,
  paddle2YUp: boolean,
  paddle2YDown: boolean,
}

export interface scoreInfo {
  p1Score: number,
  p2Score: number,
}

export default function PingPong() {
  let ping: number;
  // const [coords, setCoord] = useAtom(GameCoordinateAtom);
  const [upArrow, setUpArrow] = useState(false);
  const [downArrow, setDownArrow] = useState(false);
  // const [canvas, setCanvas] = useAtom(GameCanvas);
  const canvas = useRef<HTMLCanvasElement>(null);
  
  let coords = {
    paddle1Y: 225,
    ballX: 1150 / 2,
    ballY: 300,
    paddle2Y: 225,
    ballSpeedX: 0,
    ballSpeedY: 0,
    paddleSpeed: 0.6,
    paddle1YUp: false,
    paddle1YDown: false,
    paddle2YUp: false,
    paddle2YDown: false,
  };
  let lastUpdateTime = Date.now();
  // PressKey(["ArrowUp"], () => {
  //   let tmp = coords;
  //   tmp.leftY -= 10;
  //   setCoord(tmp);
  //   Game(coords, canvas, setCanvas});
  // });

  // PressKey(["ArrowDown"], () => {
  //   let tmp = coords;
  //   tmp.leftY += 10;
  //   setCoord(tmp);
  //   Game(coords, canvas, setCanvas});
  // });

  let pingInterval: NodeJS.Timer;
  let pingTime: number;

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

  useEffect(() => {
    const handler = (started: boolean) => {
      lastUpdateTime = Date.now();
      console.log("update start");
      update(coords, canvas);
    };
    game.gameSocket.on("start", handler);
    return () => {
      game.gameSocket.off("start", handler);
    };
  }, []);
        
  useEffect(() => {
    const handler = (gameCoord: GameCoordinate) => {
      lastUpdateTime = Date.now();
      coords = gameCoord;
      Game(coords, canvas);
    };
    game.gameSocket.on("graphic", handler);
    return () => {
      socket.off("graphic", handler);
    }
  }, []);
  
  useEffect(() => {
    const handler = (paddleInfo: paddleInfo) => {
      coords.paddle1YUp = paddleInfo.paddle1YUp;
      coords.paddle1YDown = paddleInfo.paddle1YDown;
      coords.paddle2YUp = paddleInfo.paddle2YUp;
      coords.paddle2YDown = paddleInfo.paddle2YDown;
      // lastUpdateTime = Date.now();
      Game(coords, canvas);
    };
    game.gameSocket.on("paddleInfo", handler);
    return () => {
      socket.off("paddleInfo", handler);
    }
  }, []);

  useEffect(() => {
    const handler = (scoreInfo: scoreInfo) => {
      me.score = scoreInfo.p1Score;
      opponent.score = scoreInfo.p2Score;
      Game(coords, canvas);
    };
    game.gameSocket.on("scoreInfo", handler);
    return () => {
      socket.off("scoreInfo", handler);
    }
  }, []);
  

  function update(coord:GameCoordinate, canvas:React.RefObject<HTMLCanvasElement>) {
    const curTime = Date.now();
    const dt = curTime - lastUpdateTime;

    paddleUpdate(coord.paddle1YUp, coord.paddle1YDown,coord.paddle2YUp, coord.paddle2YDown, dt);
    coord.ballX += coord.ballSpeedX * dt;
    coord.ballY += coord.ballSpeedY * dt;
    const isHitY = collisionCheckY();
    const isHitX = collisionCheckX();
    if (isHitY) {
      if (coord.ballY < ball.radius) {
        coord.ballY = 2 * ball.radius - coord.ballY;
        coord.ballSpeedY = -coord.ballSpeedY;
      } else {
        coord.ballY = 2 * (HEIGHT - ball.radius) - coord.ballY;
        coord.ballSpeedY = -coord.ballSpeedY;
      }
    }
    if (isHitX == Direction.LEFT) {
      if (collisionCheckP1Paddle() === Hit.PADDLE) {
        coord.ballX = 2 * (ball.radius + paddle.width) - coord.ballX;
        coord.ballSpeedX = -coord.ballSpeedX;
      } else {
        // need to freeze for 3 sec
      }
    } else if (isHitX === Direction.RIGHT) {
      if (collisionCheckP2Paddle() === Hit.PADDLE) {
        coord.ballX = 2 * (WIDTH - ball.radius - paddle.width) - coord.ballX;
        coord.ballSpeedX = -coord.ballSpeedX;
      } else {
        // need to freeze for 3 sec
      }
    }
    lastUpdateTime = curTime;
    // console.log(`update coord: ${JSON.stringify(coord)}`);
    Game(coord, canvas);
    requestAnimationFrame(() => update(coords, canvas));
  }
  
  function paddleUpdate(p1Up: boolean, p1Down: boolean, p2Up: boolean, p2Down: boolean, dt: number) {
    if (p1Up) {
      if (coords.paddle1Y > 0){
        coords.paddle1Y -= coords.paddleSpeed * dt;
      }
      if (coords.paddle1Y < 0) {
        coords.paddle1Y = 0;
      }
    }
    if (p1Down) {
      if (coords.paddle1Y < HEIGHT - paddle.height){
        coords.paddle1Y += coords.paddleSpeed * dt;
      }
      if (coords.paddle1Y > HEIGHT - paddle.height) {
        coords.paddle1Y = HEIGHT - paddle.height;
      }
    }
    if (p2Up) {
      if (coords.paddle2Y > 0) {
        coords.paddle2Y -= coords.paddleSpeed * dt;
      }
      if (coords.paddle2Y < 0) {
        coords.paddle2Y = 0;
      }
    }
    if (p2Down) {
      if (coords.paddle2Y < HEIGHT - paddle.height){
        coords.paddle2Y += coords.paddleSpeed * dt;
      }
      if (coords.paddle2Y > HEIGHT - paddle.height) {
        coords.paddle2Y = HEIGHT - paddle.height;
      }
    }
  }

  function collisionCheckX() {
    if (coords.ballX <= ball.radius + paddle.width) {
      return Direction.LEFT;
    } else if (coords.ballX >= WIDTH - ball.radius - paddle.width) {
      return Direction.RIGHT;
    }
    return Direction.NONE;
  }

  function collisionCheckY() {
    if (coords.ballY >= HEIGHT - ball.radius) {
      return Direction.DOWN;
    } else if (coords.ballY <= ball.radius) {
      return Direction.UP;
    }
    return Direction.NONE;
  }

  function collisionCheckP1Paddle() {
    if (coords.ballY >= coords.paddle1Y && coords.ballY <= coords.paddle1Y + paddle.height) {
      return Hit.PADDLE;
    }
    return Hit.WALL;
  }

  function collisionCheckP2Paddle() {
    if (coords.ballY >= coords.paddle2Y && coords.ballY <= coords.paddle2Y + paddle.height) {
      return Hit.PADDLE;
    }
    return Hit.WALL;
  }

  useEffect(() => {
    // first draw
    Game(coords, canvas);
    // setInterval(() => update(), 10); 
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
