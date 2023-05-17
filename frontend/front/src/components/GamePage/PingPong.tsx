import "../../styles/BackGround.css";
import "../../styles/PingPong.css";

import React, { useEffect } from "react";

import * as chatAtom from "../atom/ChatAtom";
import { isGameStartedAtom, isPrivateAtom, serverClientTimeDiffAtom } from "../atom/GameAtom";
import { Game } from "./Pong";

import * as game from "../../socket/game.socket";

import { useAtom } from "jotai";
import { useRef, useState } from "react";
import { gameResultModalAtom, isLoadingAtom } from "../atom/ModalAtom";
import {
  ball,
  Direction,
  HEIGHT,
  Hit,
  p1,
  p2,
  paddle,
  paddleInfo,
  scoreInfo,
  WIDTH,
} from "./GameInfo";

import { AdminLogPrinter } from "../../event/event.util";
import { GameCoordinate } from "../../socket/game.dto";

export default function PingPong() {
  const [upArrow, setUpArrow] = useState(false);
  const [downArrow, setDownArrow] = useState(false);
  const [adminConsole] = useAtom(chatAtom.adminConsoleAtom);
  const canvas = useRef<HTMLCanvasElement>(null);

  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);
  const [isPrivate, setIsPrivate] = useAtom(isPrivateAtom);
  const [isGameStart, setIsGameStart] = useAtom(isGameStartedAtom);
  // const [isQueue, setIsQueue] = useAtom(isQueueAtom);
  const [gameResultModal, setGameResultModal] = useAtom(gameResultModalAtom);

  // const [serverClientTimeDiff, setServerClientTimeDiff] = useAtom(serverClientTimeDiffAtom);
  
  let serverClientTimeDiff: number = 1000;

  let coords: GameCoordinate = {
    paddle1Y: 225,
    ballX: 1150 / 2,
    ballY: 300,
    paddle2Y: 225,
    ballSpeedX: 0,
    ballSpeedY: 0,
    paddleSpeed: 0.6,
    keyPress: [0, 0, 0, 0],
    time: Date.now(),
  }

  let lastUpdateTime: number = coords.time;
  let requestAnimationId: number = 0;
  
  // 1 sec delay for init value
  let pingRTTmin: number = 2000;
  let pingInterval: NodeJS.Timer;
  
  const pingEvent = () => {
    if (!isGameStart) {
      clearInterval(pingInterval);
    }
    const curTime = Date.now();
    const pingEventHandler = (serverTime: number) => {
      const now = Date.now();
      const pingRTT = now - curTime;
      AdminLogPrinter(adminConsole, `\npingRTT: ${pingRTT}ms`);
      if (pingRTTmin > pingRTT) {
        pingRTTmin = pingRTT;
        const adjServerTime = serverTime + pingRTTmin / 2;
        serverClientTimeDiff = now - adjServerTime
      }
      AdminLogPrinter(adminConsole, `pingRTTmin: ${pingRTTmin}ms`);
    };      
    game.gameSocket.emit("ping", pingEventHandler);
    // return () => {
    //   game.gameSocket.off("ping", pingEventHandler);
    // };
  };

  useEffect(()=> {
    pingInterval = setInterval(pingEvent, 1000);
    return () => {
      console.log("clear pingInterval");
      clearInterval(pingInterval);
    }
  }, []);


  const syncDataHandler = (gameCoord: GameCoordinate) => {
    coords = gameCoord;
    for (let i = 0; i < 4; i++) {
      if (coords.keyPress[i] !== 0) {
        coords.keyPress[i] += serverClientTimeDiff;
      }
    }
    coords.time += serverClientTimeDiff;
    update(Date.now(), coords.time);
    console.log("syncData update");
  };

  const scoreEventHandler = (scoreInfo: scoreInfo) => {
    p1.score = scoreInfo.p1Score;
    p2.score = scoreInfo.p2Score;
    coords.ballSpeedX = 0;
    coords.ballSpeedY = 0;
    coords.paddleSpeed = 0;
    update(Date.now(), coords.time);
    Game(coords, canvas);
  };
  
  const finishEventHandler = (scoreInfo: scoreInfo) => {
    console.log("finished!!!!!!");
    p1.score = scoreInfo.p1Score;
    p2.score = scoreInfo.p2Score;
    coords.ballSpeedX = 0;
    coords.ballSpeedY = 0;
    coords.paddleSpeed = 0;
    update(Date.now(), coords.time);
    Game(coords, canvas);
    if (isGameStart) {
      setIsGameStart(false);
    }
    if (!gameResultModal) {
      setGameResultModal(true);
    }
  };
  
  const countdownEventHandler = () => {
    AdminLogPrinter(adminConsole, "countdown!!!");
  }

  useEffect(() => {
    game.gameSocket.on("syncData", syncDataHandler);
    game.gameSocket.on("scoreInfo", scoreEventHandler);
    game.gameSocket.on("finished", finishEventHandler);
    game.gameSocket.on("countdown", countdownEventHandler);
    return () => {
      game.gameSocket.off("syncData", syncDataHandler);
      game.gameSocket.off("scoreInfo", scoreEventHandler);
      game.gameSocket.off("finished", finishEventHandler);
      game.gameSocket.off("countdown", countdownEventHandler);
    };
  }, []);

  useEffect(()=> {
    requestAnimationLoop(Date.now(), lastUpdateTime);
    return () => {
      cancelAnimationFrame(requestAnimationId);
    }
  }, []);

  // // the connection is denied by the server in a middleware function
  // game.gameSocket.on("connect_error", (err) => {
  //   if (err.message === "unauthorized") {
  //     // handle each case
  //   }
  //   console.log(err.message); // prints the message associated with the error
  // });

  function requestAnimationLoop(curTime: number, lastUpdate: number) {
    if (coords.keyPress !== null) {
      update(curTime, lastUpdate);
    }
    requestAnimationId = requestAnimationFrame(() => requestAnimationLoop(Date.now(), lastUpdateTime));
  }

  // paddle update first, and then ball position update.
  function update(curTime: number, lastUpdate: number) {
    const dt = curTime - lastUpdate;
    if (dt > 0) {
      const keyPressDt: number[] = getKeyPressDt(curTime);

      paddleUpdate(keyPressDt);
      coords.ballX += coords.ballSpeedX * dt;
      coords.ballY += coords.ballSpeedY * dt;
      const isHitY = collisionCheckY();
      const isHitX = collisionCheckX();
      if (isHitY !== Direction.NONE) {
        if (isHitY === Direction.UP) {
          coords.ballY = 2 * ball.radius - coords.ballY;
          coords.ballSpeedY = -coords.ballSpeedY;
        } else {
          coords.ballY = 2 * (HEIGHT - ball.radius) - coords.ballY;
          coords.ballSpeedY = -coords.ballSpeedY;
        }
      }
      if (isHitX !== Direction.NONE) {
        if (isHitX === Direction.LEFT) {
          if (collisionCheckP1Paddle() === Hit.PADDLE) {
            coords.ballX = 2 * (ball.radius + paddle.width) - coords.ballX;
            coords.ballSpeedX = -coords.ballSpeedX;
          }
        } else {
          if (collisionCheckP2Paddle() === Hit.PADDLE) {
            coords.ballX = 2 * (WIDTH - ball.radius - paddle.width) - coords.ballX;
            coords.ballSpeedX = -coords.ballSpeedX;
          }
        }
      }
      lastUpdateTime = curTime;
      Game(coords, canvas);
    }
  }

  function getKeyPressDt(curTime: number): number[] {
    const keyPressDt: number[] = [];
    for (let i = 0; i < 4; i++) {
      if (coords.keyPress[i] !== 0 && curTime > coords.keyPress[i]) {
        keyPressDt.push(curTime - coords.keyPress[i]);
        coords.keyPress[i] = curTime;
      } else {
        keyPressDt.push(0);
      }
    }
    return keyPressDt;
  }

  function paddleUpdate(keyPressDt: number[]) {
    if (keyPressDt[0] !== 0) {
      if (coords.paddle1Y > 0) {
        coords.paddle1Y -= coords.paddleSpeed * keyPressDt[0];
      }
      if (coords.paddle1Y < 0) {
        coords.paddle1Y = 0;
      }
    }
    if (keyPressDt[1] !== 0) {
      if (coords.paddle1Y < HEIGHT - paddle.height) {
        coords.paddle1Y += coords.paddleSpeed * keyPressDt[1];
      }
      if (coords.paddle1Y > HEIGHT - paddle.height) {
        coords.paddle1Y = HEIGHT - paddle.height;
      }
    }
    if (keyPressDt[2] !== 0) {
      if (coords.paddle2Y > 0) {
        coords.paddle2Y -= coords.paddleSpeed * keyPressDt[2];
      }
      if (coords.paddle2Y < 0) {
        coords.paddle2Y = 0;
      }
    }
    if (keyPressDt[3] !== 0) {
      if (coords.paddle2Y < HEIGHT - paddle.height) {
        coords.paddle2Y += coords.paddleSpeed * keyPressDt[3];
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
    p1.score = 0;
    p2.score = 0;
    Game(coords, canvas);
  }, []);

  useEffect(() => {
    function handleKeyPress(event: globalThis.KeyboardEvent) {
      if (event.code === "ArrowUp") {
        if (!upArrow) {
          setUpArrow(true);
          game.emitUpPress();
          AdminLogPrinter(adminConsole, "up press");
        }
      } else if (event.code === "ArrowDown") {
        if (!downArrow) {
          setDownArrow(true);
          game.emitDownPress();
          AdminLogPrinter(adminConsole, "down press");
        }
      }
    }

    function handleKeyRelease(event: globalThis.KeyboardEvent) {
      if (event.code === "ArrowUp") {
        if (upArrow) {
          setUpArrow(false);
          game.emitUpRelease();
          AdminLogPrinter(adminConsole, "up release");
        }
      } else if (event.code === "ArrowDown") {
        if (downArrow) {
          setDownArrow(false);
          game.emitDownRelease();
          AdminLogPrinter(adminConsole, "down release");
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
