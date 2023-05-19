export interface GameCoordinate {
  paddle1Y: number;
  ballX: number;
  ballY: number;
  paddle2Y: number;
  ballSpeedX: number;
  ballSpeedY: number;
  paddleSpeed: number;
  keyPress: number[];
  time: number;
}

export const enum GameType {
  PUBLIC = 0,
  PRIVATE = 1,
}