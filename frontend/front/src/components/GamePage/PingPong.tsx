import "../../styles/BackGround.css";
import "../../styles/PingPong.css";

import React, { useEffect } from "react";

import { GameCoordinate } from "../atom/GameAtom";
import { Game } from "./Pong";

import * as game from "../../socket/game.socket";

import { useRef, useState } from "react";
import { socket } from "../../socket/chat.socket";
import { ball, Direction, HEIGHT, Hit, p1, p2, paddle, paddleInfo, scoreInfo, WIDTH } from "./GameInfo";

export default function PingPong() {
  const [upArrow, setUpArrow] = useState(false);
  const [downArrow, setDownArrow] = useState(false);
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

  let pingInterval: NodeJS.Timer;
  let pingTime: number;

  game.gameSocket.on("connect", () => {
    if (game.gameSocket.connected) {
      //This attribute describes whether the socket is currently connected to the server.
      if (game.gameSocket.recovered) {
        // any missed packets will be received
      } else {
        // new or unrecoverable session
        console.log("gameSocket connected");
        pingInterval = setInterval(() => {
          const curTime = Date.now();
          const handler = (pong: boolean) => {
            if (pong) {
              pingTime = Date.now() - curTime;
              console.log(`ping: ${pingTime}ms`);
            }
          }
          game.gameSocket.emit('ping', handler);
          return () => {
            game.gameSocket.off('ping', handler);
          }
        }, 1000);
      }
    }
    return () => {
      game.gameSocket.off("connect");
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
    console.log(`coords: ${JSON.stringify(coords)}`)
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
      Game(coords, canvas);
    };
    game.gameSocket.on("paddleInfo", handler);
    return () => {
      socket.off("paddleInfo", handler);
    }
  }, []);

  useEffect(() => {
    const handler = (scoreInfo: scoreInfo) => {
      p1.score = scoreInfo.p1Score;
      p2.score = scoreInfo.p2Score;
      coords.ballSpeedX = 0;
      coords.ballSpeedY = 0;
      coords.paddleSpeed = 0;
      Game(coords, canvas);
    };
    game.gameSocket.on("scoreInfo", handler);
    return () => {
      socket.off("scoreInfo", handler);
    }
  }, []);

  useEffect(() => {
    const handler = (scoreInfo: scoreInfo) => {
      p1.score = scoreInfo.p1Score;
      p2.score = scoreInfo.p2Score;
      coords.ballSpeedX = 0;
      coords.ballSpeedY = 0;
      coords.paddleSpeed = 0;
      Game(coords, canvas);
    };
    game.gameSocket.on("finished", handler);
    return () => {
      socket.off("finished", handler);
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
      }
    } else if (isHitX === Direction.RIGHT) {
      if (collisionCheckP2Paddle() === Hit.PADDLE) {
        coord.ballX = 2 * (WIDTH - ball.radius - paddle.width) - coord.ballX;
        coord.ballSpeedX = -coord.ballSpeedX;
      }
    }
    lastUpdateTime = curTime;
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
  }, []);

  useEffect(() => {
    function handleKeyPress(event: globalThis.KeyboardEvent) {
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
