import { me, opponent, net, ball, HEIGHT, WIDTH } from "./GameInfo";

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
    context.font = "75px fantasy";
    context.fillText(text.toString(), x, y);
  }
}

function drawNet(context: CanvasRenderingContext2D) {
  for (let i = 0; i <= HEIGHT; i += 20) {
    drawRect(net.x, net.y + i, net.width, net.height, net.color, context);
  }
}

export function game() {
  const canvas = document.getElementById("pong") as HTMLCanvasElement;
  const context = canvas?.getContext("2d");

  if (context) {
    drawRect(0, 0, 1150, 600, "black", context);
    //net
    drawNet(context);
    //bar
    drawRect(me.x, me.y, me.width, me.height, me.color, context);
    drawRect(opponent.x, opponent.y, opponent.width, opponent.height, opponent.color, context);
    //ball
    drawCircle(ball.x, ball.y, ball.radius, ball.color, context);
    //score
    drawText(me.score, WIDTH / 4, HEIGHT / 5, "WHITE", context);
    drawText(opponent.score, 3 * (WIDTH / 4), HEIGHT / 5, "WHITE", context);
  }
}