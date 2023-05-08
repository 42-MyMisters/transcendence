import React from "react";
import { GameCoordinate } from "../atom/GameAtom";
import { ball, HEIGHT, net, p1, p2, WIDTH } from "./GameInfo";

function drawRect(
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  context: CanvasRenderingContext2D
) {
  if (context) {
    context.fillStyle = color;
    context.fillRect(x, y, w, h);
  }
}

function drawCircle(
  x: number,
  y: number,
  r: number,
  color: string,
  context: CanvasRenderingContext2D
) {
  if (context) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, r, 0, Math.PI * 2, false);
    context.closePath();
    context.fill();
  }
}

function drawText(
  text: number,
  x: number,
  y: number,
  color: string,
  context: CanvasRenderingContext2D
) {
  if (context) {
    context.fillStyle = color;
    context.font = "50px Arial";
    context.fillText(text.toString(), x, y);
  }
}

function drawNet(context: CanvasRenderingContext2D) {
  for (let i = 0; i <= HEIGHT; i += 40) {
    drawRect(net.x, net.y + i, net.width, net.height, net.color, context);
  }
}

export function Game(gameInfo: GameCoordinate, canvas: React.RefObject<HTMLCanvasElement>) {
  const canv = canvas.current;
  const context = canv?.getContext("2d");
  if (context) {
    context.clearRect(0, 0, 1150, 600);
    drawRect(0, 0, 1150, 600, "black", context);
    //net
    drawNet(context);
    //bar
    drawRect(p1.x, gameInfo.paddle1Y, p1.width, p1.height, p1.color, context);
    drawRect(p2.x, gameInfo.paddle2Y, p2.width, p2.height, p2.color, context);
    //ball
    drawCircle(gameInfo.ballX, gameInfo.ballY, ball.radius, ball.color, context);
    //score
    drawText(p1.score, WIDTH / 4, 50, "WHITE", context);
    drawText(p2.score, 3 * (WIDTH / 4), 50, "WHITE", context);
  }
}
