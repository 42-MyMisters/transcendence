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

export interface scoreInfo {
  p1Score: number,
  p2Score: number,
}

export const enum Direction {
  NONE = 0,
  UP = 1,
  DOWN = 2,
  LEFT = 3,
  RIGHT = 4
}

export const enum Hit {
  PADDLE = 1,
  WALL = 0,
}

export const enum GameType {
  PUBLIC = 0,
  PRIVATE = 1,
}