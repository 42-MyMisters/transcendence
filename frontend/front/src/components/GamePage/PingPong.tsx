import "../../styles/BackGround.css";
import "../../styles/PingPong.css";

import React, { useEffect } from "react";

import * as chatAtom from "../atom/ChatAtom";
import { GameCoordinate, isQueueAtom } from "../atom/GameAtom";
import { Game } from "./Pong";

import * as game from "../../socket/game.socket";

import { useAtom } from "jotai";
import { useRef, useState } from "react";
import { gameResultModalAtom, isLoadingAtom } from "../atom/ModalAtom";
import { ball, Direction, HEIGHT, Hit, p1, p2, paddle, paddleInfo, scoreInfo, WIDTH } from "./GameInfo";

import { AdminLogPrinter } from "../../event/event.util";

export default function PingPong() {
  const [upArrow, setUpArrow] = useState(false);
  const [downArrow, setDownArrow] = useState(false);
  const [adminConsole] = useAtom(chatAtom.adminConsoleAtom);
  const canvas = useRef<HTMLCanvasElement>(null);
  
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);
  const [isQueue, setIsQueue] = useAtom(isQueueAtom);
  const [gameResultModal, setGameResultModal] = useAtom(gameResultModalAtom);

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
    time: Date.now(),
  }
  let lastUpdateTime = coords.time;

  let pingInterval: NodeJS.Timer;

  // 1 sec delay for init value 
  let pingRTTmin: number = 2000;
  let serverClientTimeDiff: number;
  let gameServerConnected: boolean = false;
  
  const connectionEventHandler = () => {
    if (game.gameSocket.connected) {
      //This attribute describes whether the socket is currently connected to the server.
      if (game.gameSocket.recovered) {
        // any missed packets will be received
      } else {
        // new or unrecoverable session
        AdminLogPrinter(adminConsole, "gameSocket connected");
        pingInterval = setInterval(pingEvent, 1000);
      }
    }
  }
  
  const pingEvent = () => {
    const curTime = Date.now();
    const pingEventHandler = (serverTime: number) => {
      const now = Date.now();
      const pingRTT = now - curTime;
      AdminLogPrinter(adminConsole, `pingRTT: ${pingRTT}ms`);
      if (pingRTTmin > pingRTT) {
        pingRTTmin = pingRTT;
        const adjServerTime = serverTime + pingRTTmin / 2;
        serverClientTimeDiff = now - adjServerTime;
      }
      AdminLogPrinter(adminConsole, `pingRTTmin: ${pingRTTmin}ms`);
      AdminLogPrinter(adminConsole, `serverClientTimeDiff: ${serverClientTimeDiff}ms`);
    }
    game.gameSocket.emit('ping', pingEventHandler);
    return () => {
      game.gameSocket.off('ping', pingEventHandler);
    }
  }

  //https://socket.io/docs/v4/client-socket-instance/#disconnect
  const disconnectEventHandler = (reason: string) => {
    if (reason === "io server disconnect") {
    }
    clearInterval(pingInterval);
    setIsQueue(false);
    setIsLoading(false);
    AdminLogPrinter(adminConsole, "gameSocket disconnected");
  }

  const startEventHandler = () => {
    lastUpdateTime = Date.now();
    AdminLogPrinter(adminConsole, "game start");
    update(lastUpdateTime);
  }

  const syncDataHandler = (gameCoord: GameCoordinate) => {
    lastUpdateTime = Date.now();
    coords = gameCoord;
    update(coords.time + serverClientTimeDiff);
    Game(coords, canvas);
  }

  const paddleEventHandler = (paddleInfo: paddleInfo) => {
    coords.paddle1YUp = paddleInfo.paddle1YUp;
    coords.paddle1YDown = paddleInfo.paddle1YDown;
    coords.paddle2YUp = paddleInfo.paddle2YUp;
    coords.paddle2YDown = paddleInfo.paddle2YDown;
    Game(coords, canvas);
  }

  const scoreEventhandler = (scoreInfo: scoreInfo) => {
    p1.score = scoreInfo.p1Score;
    p2.score = scoreInfo.p2Score;
    coords.ballSpeedX = 0;
    coords.ballSpeedY = 0;
    coords.paddleSpeed = 0;
    Game(coords, canvas);
  }

  const finishEventHandler = (scoreInfo: scoreInfo) => {
    p1.score = scoreInfo.p1Score;
    p2.score = scoreInfo.p2Score;
    coords.ballSpeedX = 0;
    coords.ballSpeedY = 0;
    coords.paddleSpeed = 0;
    Game(coords, canvas);
  }

  const queueEventHandler = (isQueue: boolean) => {
    setIsQueue(isQueue);
  }

  const loadingEventHandler = (isLoading: boolean) => {
    setIsLoading(isLoading);
  }

  useEffect(() => {
    game.gameSocket.on("connect", connectionEventHandler);
    game.gameSocket.on("isQueue", queueEventHandler);
    game.gameSocket.on("isLoading", loadingEventHandler);
    game.gameSocket.on("disconnect", disconnectEventHandler);
    game.gameSocket.on("start", startEventHandler);
    game.gameSocket.on("scoreInfo", scoreEventhandler);
    game.gameSocket.on("finished", finishEventHandler);
    game.gameSocket.on("paddleInfo", paddleEventHandler);
    game.gameSocket.on("syncData", syncDataHandler);
    return () => {
      game.gameSocket.off("connect", connectionEventHandler);
      game.gameSocket.off("isQueue", queueEventHandler);
      game.gameSocket.off("isLoading", loadingEventHandler);
      game.gameSocket.off("disconnect", disconnectEventHandler);
      game.gameSocket.off("start", startEventHandler);
      game.gameSocket.off("syncData", syncDataHandler);
      game.gameSocket.off("paddleInfo", paddleEventHandler);
      game.gameSocket.off("scoreInfo", scoreEventhandler);
      game.gameSocket.off("finished", finishEventHandler);
    }
  }, []);



  // // the connection is denied by the server in a middleware function
  // game.gameSocket.on("connect_error", (err) => {
  //   if (err.message === "unauthorized") {
  //     // handle each case
  //   }
  //   console.log(err.message); // prints the message associated with the error
  // });

  // game.gameSocket.on(
  //   "join-game",
  //   ({ uid_left, p1, uid_right }: { uid_left: string; p1: number; uid_right: string }) => { }
  // );

  // paddle update first, and then ball position update.
  function update(curTime: number) {
    const dt = curTime - lastUpdateTime;

    paddleUpdate(coords.paddle1YUp, coords.paddle1YDown, coords.paddle2YUp, coords.paddle2YDown, dt);
    coords.ballX += coords.ballSpeedX * dt;
    coords.ballY += coords.ballSpeedY * dt;
    const isHitY = collisionCheckY();
    const isHitX = collisionCheckX();
    if (isHitY) {
      if (coords.ballY < ball.radius) {
        coords.ballY = 2 * ball.radius - coords.ballY;
        coords.ballSpeedY = -coords.ballSpeedY;
      } else {
        coords.ballY = 2 * (HEIGHT - ball.radius) - coords.ballY;
        coords.ballSpeedY = -coords.ballSpeedY;
      }
    }
    if (isHitX == Direction.LEFT) {
      if (collisionCheckP1Paddle() === Hit.PADDLE) {
        coords.ballX = 2 * (ball.radius + paddle.width) - coords.ballX;
        coords.ballSpeedX = -coords.ballSpeedX;
      }
    } else if (isHitX === Direction.RIGHT) {
      if (collisionCheckP2Paddle() === Hit.PADDLE) {
        coords.ballX = 2 * (WIDTH - ball.radius - paddle.width) - coords.ballX;
        coords.ballSpeedX = -coords.ballSpeedX;
      }
    }
    lastUpdateTime = curTime;
    Game(coords, canvas);
    requestAnimationFrame(() => update(Date.now()));
  }

  function paddleUpdate(p1Up: boolean, p1Down: boolean, p2Up: boolean, p2Down: boolean, dt: number) {
    if (p1Up) {
      if (coords.paddle1Y > 0) {
        coords.paddle1Y -= coords.paddleSpeed * dt;
      }
      if (coords.paddle1Y < 0) {
        coords.paddle1Y = 0;
      }
    }
    if (p1Down) {
      if (coords.paddle1Y < HEIGHT - paddle.height) {
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
      if (coords.paddle2Y < HEIGHT - paddle.height) {
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
