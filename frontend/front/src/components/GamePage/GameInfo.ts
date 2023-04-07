export const WIDTH = 1150;
export const HEIGHT = 600;

export const START_X = 100;
export const START_Y = 0;

export const me = {
  x: 0,
  y: START_Y,
  width: 20,
  height: 150,
  color: "WHITE",
  score: 0,
};

export const opponent = {
  x: WIDTH - 20,
  y: START_Y + HEIGHT / 2 - 150 / 2,
  width: 20,
  height: 150,
  color: "WHITE",
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