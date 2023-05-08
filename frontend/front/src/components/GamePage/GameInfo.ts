export const WIDTH = 1150;
export const HEIGHT = 600;

export const START_X = 100;
export const START_Y = 225;

export const p1 = {
  x: 10,
  y: START_Y,
  width: 20,
  height: 150,
  color: "WHITE",
  score: 0,
};

export const p2 = {
  x: WIDTH - 30,
  y: START_Y,
  width: 20,
  height: 150,
  color: "#CA6A71",
  score: 0,
};

export const net = {
  x: WIDTH / 2 - 2 / 2,
  y: 0,
  width: 2,
  height: 20,
  color: "WHITE",
};

export const ball = {
  x: WIDTH / 2,
  y: HEIGHT / 2,
  radius: 15,
  color: "WHITE",
};

export const paddle = {
  width: 30,
  height: 150,
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