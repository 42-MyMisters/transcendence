import React from "react";
import { GameCoordinate } from "../../socket/game.dto";
import { ball, HEIGHT, net, player1, player2, WIDTH } from "./GameInfo";
import { useAtomValue } from 'jotai';
import PlayerRecordBoard from './PlayerRecordBoard';

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

function drawName(
  text: string,
  x: number,
  y: number,
  color: string,
  context: CanvasRenderingContext2D
) {
  if (context) {
    context.fillStyle = color;
    context.font = "30px Arial";
    context.fillText(text, x, y);
  }
}

function drawCounter(
  text: number,
  x: number,
  y: number,
  color: string,
  context: CanvasRenderingContext2D
) {
  if (context) {
    context.fillStyle = color;
    context.font = "100px Arial";
    context.fillText(text.toString(), x, y);
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
    drawCircle(player1.x + player1.width / 2, gameInfo.paddle1Y + player1.width / 2, player1.width / 2, player1.color, context);
    drawRect(player1.x, gameInfo.paddle1Y + player1.width / 2, player1.width, player1.height - player1.width, player1.color, context);
    drawCircle(player1.x + player1.width / 2, gameInfo.paddle1Y + player1.height - player1.width / 2, player1.width / 2, player1.color, context);

    drawCircle(player2.x + player2.width / 2, gameInfo.paddle2Y + player2.width / 2, player2.width / 2, player2.color, context);
    drawRect(player2.x, gameInfo.paddle2Y + player2.width / 2, player2.width, player2.height - player2.width, player2.color, context);
    drawCircle(player2.x + player2.width / 2, gameInfo.paddle2Y + player2.height - player2.width / 2, player2.width / 2, player2.color, context);
    //ball
    drawCircle(gameInfo.ballX, gameInfo.ballY, ball.radius, ball.color, context);
    //score
    drawText(player1.score, WIDTH / 4, 50, "WHITE", context);
    drawText(player2.score, 3 * (WIDTH / 4), 50, "WHITE", context);

    drawCounter(3, (WIDTH / 2) - 25, (HEIGHT / 2), "WHITE", context);

    drawName(player1.name, 75, 50, "WHITE", context);
    drawName(player2.name, (WIDTH / 4) * 3 + 50, 50, "WHITE", context);
  }
}
