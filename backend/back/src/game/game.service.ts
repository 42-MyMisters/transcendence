import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class GameService {
  private games = new Map<string, Game>();

  createGame(gameId: string, p1: Socket, p2: Socket) {
    try{
      this.games.set(gameId, new Game(gameId));
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
  // frame per sec
  private fps = 41;
  private canvasWidth = 600;
  private canvasHeight = 400;
  private ballRadius = 10;
  private paddleHeight = 100;
  private paddleWidth = 10;
  private paddleSpeed = 10;
  private ballSpeedX = 5;
  private ballSpeedY = 0;
  private id: string;
  private ballX: number;
  private ballY: number;
  private paddle1Y: number;
  private paddle2Y: number;
  private running: boolean;
  private round: number;
  private roundTime: number;
  private p1Score: number;
  private p2Score: number;
  private score_max = 5;
  private socket: Socket;
  private now: number;
  
  constructor(id: string) {
    this.id = id;
    this.ballX = this.canvasWidth / 2;
    this.ballY = this.canvasHeight / 2;
    this.paddle1Y = this.canvasHeight / 2;
    this.paddle2Y = this.canvasHeight / 2;
    this.running = true;
    // countdown time 3sec
    this.roundTime = -3000;
    this.p1Score = 0;
    this.p2Score = 0;
    this.now = Date.now();
  }

  isRunning() {
    return this.running;
  }

  gameStart() {
    this.now = Date.now();
    const interval = setInterval(() => {
      this.update();
      if (this.isRunning() == false || this.round ) {
        // save data to db
        clearInterval(interval);
      }
    }, this.fps);
  }

  update() {
    if (this.p1Score < this.score_max && this.p2Score < this.score_max) {
      // 3 sec count down.
      this.roundTime += this.fps;
      if (this.roundTime > 0 && this.isRunning() == true) {
        this.ballX += this.ballSpeedX;
        this.ballY += this.ballSpeedY;
        this.collisionCheck();
        if (this.hitPaddleCheck() === 3) {
          // startNewRound()
        }
        this.socket.to(this.id).emit('status', this.getState());
        console.log(`update: id: ${this.id}, ingame time: ${this.roundTime}, time from start: ${Date.now() - this.now}`);
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
  }

  hitPaddleCheck(): number {
    if (this.ballX < this.ballRadius) {
      if (this.ballY < this.paddle1Y - this.paddleHeight / 2 || this.ballY > this.paddle1Y + this.paddleHeight / 2 ) {
        console.log('p2 scored');
        this.p2Score++;
        return 3;
      } else {
        this.ballX = 2 * this.ballRadius - this.ballX;
        this.ballSpeedX = -this.ballSpeedX;
        return 1;
      }
    } else if (this.ballX > this.canvasWidth - this.ballRadius) {
      if (this.ballY < this.paddle2Y - this.paddleHeight / 2 || this.ballY > this.paddle2Y + this.paddleHeight / 2 ) {
        console.log('p1 scored');
        this.p1Score++;
        return 3;
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
