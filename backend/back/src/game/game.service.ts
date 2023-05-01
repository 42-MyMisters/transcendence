import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Namespace, Socket } from 'socket.io';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class GameService {
  private games: Map<string, Game>;
  constructor(
    private readonly databaseService: DatabaseService,
    ) {
      this.games = new Map<string, Game>();
  }

  createGame(gameId: string, nsp:Namespace, p1Id: string, p2Id: string) {
    try{
      this.games.set(gameId, new Game(gameId, nsp, p1Id, p2Id, this.databaseService));
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

const enum DIRECTION {
  NONE = 0, // => hmm...
  UP = 1,
  DOWN = 2,
  LEFT = 3,
  RIGHT = 4
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
    private readonly nsp: Namespace,
    private readonly p1: string,
    private readonly p2: string,
    private readonly databaseService: DatabaseService,
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
        // this.databaseService.save
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
        const isHitY = this.collisionCheckY();
        const isHitX = this.collisionCheckX();
        if (isHitY) {
          if (this.ballY < this.ballRadius) {
            this.ballY = 2 * this.canvasHeight - this.ballY ;
            this.ballSpeedY = -this.ballSpeedY;
          } else {
            this.ballY = 2 * this.ballRadius - this.ballY;
            this.ballSpeedY = -this.ballSpeedY;
          }
        }
        if (isHitX == DIRECTION.LEFT) {
          if (this.collisionCheckP1Paddle()) {
            this.ballX = 2 * this.ballRadius - this.ballX;
            this.ballSpeedX = -this.ballSpeedX;
          } else {
            console.log('p2 scored');
            this.p2Score++;
            this.init();
          }
        } else if (isHitX == DIRECTION.RIGHT) {
          if (this.collisionCheckP2Paddle()) {
            this.ballX = 2 * this.canvasWidth - this.ballX;
            this.ballSpeedX = -this.ballSpeedX;
          } else {
            console.log('p1 scored');
            this.p1Score++;
            this.init();
          }
        }
        console.log(`update: id: ${this.id}, ingame time: ${this.roundTime}, time from start: ${Date.now() - this.now}`);
        this.nsp.to(this.id).emit('status', this.getState());
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

  collisionCheckX() {
    if (this.ballX < this.ballRadius + this.paddleWidth) {
      return DIRECTION.LEFT;
    } else if (this.ballX > this.canvasWidth - this.ballRadius - this.paddleWidth) {
      return DIRECTION.RIGHT;
    }
    return DIRECTION.NONE;
  }

  collisionCheckY() {
    if (this.ballY > this.canvasHeight - this.ballRadius) {
      return DIRECTION.UP;
    } else if (this.ballY < this.ballRadius) {
      return DIRECTION.DOWN;
    }
    return DIRECTION.NONE;
  }

  collisionCheckP1Paddle() {
    if (this.ballY >= this.paddle1Y - this.paddleHeight / 2 && this.ballY <= this.paddle1Y + this.paddleHeight / 2) {
      return true;
    }
    return false;
  }
  
  collisionCheckP2Paddle() {
    if (this.ballY >= this.paddle2Y - this.paddleHeight / 2 && this.ballY <= this.paddle2Y + this.paddleHeight / 2) {
      return true;
    }
    return false;
  }

  getState() {
    return {
      ballX: this.ballX,
      ballY: this.ballY,
      paddle1Y: this.paddle1Y,
      paddle2Y: this.paddle2Y,
    };
  }

  isPlayer(id: string) {
    return (this.p1 === id || this.p2 === id);
  }

  playerLeft(id: string) {
    this.running = false;
    if (this.p1 == id) {
      this.p1Score = -1;
    } else {
      this.p2Score = -1;
    }
  }

}
