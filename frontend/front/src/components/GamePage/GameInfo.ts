export const WIDTH = 1150;
export const HEIGHT = 600;

export const START_X = 100;
export const START_Y = 0;

export const me = {
  x: 0,
  y: START_Y,
  width: 10,
  height: 100,
  color: "WHITE",
  score: 0,
};

export const opponent = {
  // const centerX = WIDTH / 2 + net.x;
  x: WIDTH - 10,
  y: START_Y + HEIGHT / 2 - 100 / 2,
  width: 10,
  height: 100,
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
  radius: 20,
  color: "WHITE",
};
