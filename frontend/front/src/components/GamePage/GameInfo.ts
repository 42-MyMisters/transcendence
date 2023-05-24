export const WIDTH = 1150;
export const HEIGHT = 600;

export const START_X = 100;
export const START_Y = 225;

export const player1 = {
  x: 10,
  y: START_Y,
  width: 20,
  height: 150,
  color: "#79E0EE",
  score: 0,
  uid: 0,
  name: 'Norminette',
};

export const player2 = {
  x: WIDTH - 30,
  y: START_Y,
  width: 20,
  height: 150,
  color: "#CA6A71",
  score: 0,
  uid: 0,
  name: 'LoremIpsum',
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
