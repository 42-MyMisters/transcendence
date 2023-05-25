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

export const enum GameStatus {
  MODESELECT = 0,
  COUNTDOWN = 1,
  RUNNING = 2,
  FINISHED = 3,
  DISCONNECT = 4,
}

export const enum GameMode {
  DEFAULT = 0,
  SPEED = 1,
}

export enum GameType {
  PUBLIC = 0,
  PRIVATE = 1
}
