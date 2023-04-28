import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class GameService {
  private games: Map<string, Game>;
  constructor(
    ) {
      this.games = new Map<string, Game>();
  }

  createGame(gameId: string, p1: Socket, p2: Socket) {
    try{
      this.games.set(gameId, new Game(gameId, p1, p2));
    } catch (e) {
      return new InternalServerErrorException("Fail to create game.")
    }
  }

  getGame(gameId: string) {
    return this.games.get(gameId);
  }

  deleteGame(gameId: string) {
    this.games.delete(gameId);
  }
}

class Game {
  
  private ballSpeedX: number;
  private ballSpeedY: number;
  private ballX: number;
  private ballY: number;
  private paddle1Y: number;
  private paddle2Y: number;
  private running: boolean;
  private round: number;
  private roundTime: number;
  private now: number;
  
  private p1Score: number;
  private p2Score: number;
  private p1KeyUp: boolean;
  private p2KeyUp: boolean;
  private p1KeyDown: boolean;
  private p2KeyDown: boolean;
  
  constructor(
    private readonly id: string,
    private readonly p1: Socket,
    private readonly p2: Socket,
    // Fixed param set
    private readonly fps = 41,
    private readonly canvasWidth = 600,
    private readonly canvasHeight = 400,
    private readonly ballRadius = 10,
    private readonly paddleHeight = 100,
    private readonly paddleWidth = 5,
    private readonly paddleSpeed = 0,
    private readonly paddleSpeedMax = canvasHeight / 20,
    private readonly maxScore = 5,
    ) {
    this.running = true;
    // countdown time 3sec
    this.p1Score = 0;
    this.p2Score = 0;
    this.now = Date.now();
    this.init();
  }
  
  isRunning() {
    return this.running;
  }
  
  init() {
    this.ballX = this.canvasWidth / 2;
    this.ballY = this.canvasHeight / 2;
    this.ballSpeedX = this.canvasWidth / 80;
    this.ballSpeedY = this.canvasHeight / 80;
    this.paddle1Y = this.canvasHeight / 2;
    this.paddle2Y = this.canvasHeight / 2;
    this.roundTime = -3000;
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
    if (this.p1Score < this.maxScore && this.p2Score < this.maxScore) {
      // 3 sec count down.
      this.roundTime += this.fps;
      if (this.roundTime > 0 && this.isRunning() == true) {
        this.ballX += this.ballSpeedX;
        this.ballY += this.ballSpeedY;
        this.collisionCheck();
        console.log(`update: id: ${this.id}, ingame time: ${this.roundTime}, time from start: ${Date.now() - this.now}`);
        this.p1.to(this.id).emit('status', this.getState());
      }
    } else {
      if (this.p1Score > this.p2Score) {
        console.log('p1 win');
      }
      else {
        console.log('p2 win');
      }
      this.running = false;
    }
  }
  
  collisionCheck() {
    if (this.ballY < 0 + this.ballRadius) {
      this.ballY = 2 * this.ballRadius - this.ballY;
      this.ballSpeedY = -this.ballSpeedY;
    } else if (this.ballY > this.canvasHeight - this.ballRadius) {
      this.ballY = 2 * this.canvasHeight - this.ballY ;
      this.ballSpeedY = -this.ballSpeedY;
    }
    if (this.hitPaddleCheck() === 0) {
      // startNewRound()
    }
  }

  hitPaddleCheck(): number {
    if (this.ballX < this.ballRadius + this.paddleWidth) {
      if (this.ballY < this.paddle1Y - this.paddleHeight / 2 || this.ballY > this.paddle1Y + this.paddleHeight / 2 ) {
        console.log('p2 scored');
        this.p2Score++;
        this.init();
      } else {
        this.ballX = 2 * this.ballRadius - this.ballX;
        this.ballSpeedX = -this.ballSpeedX;
        return 1;
      }
    } else if (this.ballX > this.canvasWidth - this.ballRadius - this.paddleWidth) {
      if (this.ballY < this.paddle2Y - this.paddleHeight / 2 || this.ballY > this.paddle2Y + this.paddleHeight / 2 ) {
        console.log('p1 scored');
        this.p1Score++;
        this.init();
      } else {
        this.ballX = 2 * this.ballRadius - this.ballX;
        this.ballSpeedX = -this.ballSpeedX;
        return 1;
      }
    }
    return 0;
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
