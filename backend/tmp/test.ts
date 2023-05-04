
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
  private now: number;
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
    this.now = Date.now();
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
        console.log(`update: id: ${this.id}, ingame time: ${this.time}, time from start: ${Date.now() - this.now}`);
    }
    if (this.p1_score > this.score_max || this.p2_score > this.score_max) {
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

const map = new Map<number, Game>();

map.set(1, new Game(1));
map.set(2, new Game(2));

map.get(1)?.gameStart();

setTimeout(() => {
  map.get(2)?.gameStart();
}, 5000);

console.log('dddddddddd');