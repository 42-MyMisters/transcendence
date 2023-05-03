
class Game {
  private fps = 41;
  private canvasWidth = 600;
  private canvasHeight = 400;
  private ballRadius = 10;
  private paddleHeight = 100;
  private paddleWidth = 10;
  private paddleSpeed = 10;
  private ballSpeedX = 5;
  private ballSpeedY = 0;
  private id: number;
  private ballX: number;
  private ballY: number;
  private paddle1Y: number;
  private paddle2Y: number;
  private running: boolean;
  private time: number;
  private p1_score: number;
  private p2_score: number;
  private score_max = 5;
  
  constructor(id: number) {
    this.id = id;
    this.ballX = 50;
    this.ballY = 50;
    this.paddle1Y = 250;
    this.paddle2Y = 250;
    this.running = true;
    this.time = -3000;
    this.p1_score = 0;
    this.p2_score = 0;
  }

  isRunning() {
    return this.running;
  }

  gameStart() {
    const interval = setInterval(() => {
      this.update();
      if (this.isRunning() == false) {
        // save data to db
        clearInterval(interval);
      }
    }, this.fps);
  }

  update() {
    this.time += this.fps;
    if (this.time > 0 && this.isRunning() == true) {
        this.ballX += this.ballSpeedX;
        this.ballY += this.ballSpeedY;
        console.log(`update: ${this.time}, ${this.ballX}, ${this.ballY}`);
        this.p1_score += 1
    }
    if (this.p1_score == this.score_max || this.p2_score == this.score_max) {
      this.running = false;
    }
  }

  collisionDetect() {
  }
  
  getState() {
    return {
      ballX: this.ballX,
      ballY: this.ballY,
      paddle1Y: this.paddle1Y,
      paddle2Y: this.paddle2Y,
    };
  }
}

// const game = new Game(1);
// const interval = setInterval(() => {
//   game.update();
//   if (game.tmp > 10) {
//     clearInterval(interval);
//   }
// }, 500);
// let ballX = 0;
// let ballY = 0;
// let tmp = 0;

// function update() {
//   if (tmp < 100) {
//       console.log(`update: ${tmp}, ${ballX}, ${ballY}`);
//       tmp += 1
//       ballX += 1
//       ballY += 1
//   }
// }

const map = new Map();
// const map = new Map<number, Game>();

map.set(1, new Game(1));
map.set(2, new Game(2));

map.get(1)?.gameStart();

const now = Date.now();
console.log('asdfasdfasdf');
console.log('asdfasdfasdf');

while(Date.now() - now < 3000) {
}

map.get(2)?.gameStart();

console.log('asdfasdfasdf');
console.log('dddddddddd');