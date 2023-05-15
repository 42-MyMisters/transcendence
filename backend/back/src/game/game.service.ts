import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { Namespace } from "socket.io";
import { DatabaseService } from "src/database/database.service";
import { Direction, GameMode, GameStatus, GameType, Hit } from "./game.enum";
import { Game as GameEntity } from "../database/entity/game.entity";

interface GameCoords {
  paddle1Y: number,
  ballX: number,
  ballY: number,
  paddle2Y: number,
  ballSpeedX: number,
  ballSpeedY: number,
  paddleSpeed: number,
  keyPress: number[],
  time: number,
}

@Injectable()
export class GameService {
  private games: Map<string, Game>;
  constructor(private readonly databaseService: DatabaseService) {
    this.games = new Map<string, Game>();
  }
  
  publicGame(gameId: string, nsp: Namespace, p1Id: number, p2Id: number) {
    this.createGame(gameId, nsp, p1Id, p2Id, GameType.PUBLIC);
  }
  
  privateGame(gameId: string, nsp: Namespace, p1Id: number, p2Id: number) {
    this.createGame(gameId, nsp, p1Id, p2Id, GameType.PRIVATE);
  }

  createGame(gameId: string, nsp: Namespace, p1Id: number, p2Id: number, gameType: GameType) {
    try {
      this.games.set(gameId, new Game(gameId, nsp, p1Id, p2Id, gameType, this.databaseService));
    } catch (e) {
      throw new InternalServerErrorException("Fail to create game.");
    }
  }

  getGame(gameId: string) {
    return this.games.get(gameId);
  }

  deleteGame(gameId: string) {
    this.games.delete(gameId);
  }

  gameStart(gameId: string) {
    const curGame = this.games.get(gameId);
    if (curGame !== undefined) {
      curGame.gameStart();
    }
  }

}

class Game {
  private ballSpeedX: number;
  private ballSpeedY: number;
  private ballX: number;
  private ballY: number;
  private paddle1Y: number;
  private paddle2Y: number;
  private gameStatus: GameStatus;
  private round: number;
  
  private gameMode: GameMode;
  private gameModeTmp: GameMode;

  private roundStartTime: number;
  private lastUpdate: number;
  private lastUpdateCoords: GameCoords;

  private p1Score: number;
  private p2Score: number;

  private score: number[] = [0, 0];

  // key pressed time list [p1up, p1down, p2up, p2down]
  private keyPress: number[] = [0, 0, 0, 0];

  private ballSpeedMultiplier: number = 1.4;
  private ballSpeedMax:number;
  
  constructor(
    private readonly id: string,
    private readonly nsp: Namespace,
    private readonly p1: number,
    private readonly p2: number,
    private readonly gameType: GameType,
    private readonly databaseService: DatabaseService,
    // Fixed param set
    private readonly canvasWidth = 1150,
    private readonly canvasHeight = 600,
    private readonly ballRadius = 15,
    private readonly paddleHeight = 150,
    private readonly paddleWidth = 30,
    private readonly paddleSpeed = 0.6,
    private readonly maxScore = 5,
    ) {
    this.ballSpeedMax = canvasWidth / 2000 * this.ballSpeedMultiplier,
    // this.score[0] = this.score[1] = 0;
    this.round = 0;
  }

  private init() {
    this.ballX = this.canvasWidth / 2;
    this.ballY = this.canvasHeight / 2;
    this.ballSpeedX = this.ballSpeedMax;
    if (Math.random() >= 0.5) {
      this.ballSpeedX = -this.ballSpeedX;
    }
    // +-35 degree range.
    this.ballSpeedY = this.ballSpeedX * 0.7 * (Math.random() * 2 - 1);
    this.ballSpeedY = 0;
    for (let i = 0; i < 4; i++) {
      this.keyPress[i] = 0;
    }
    this.paddle1Y = this.paddle2Y = (this.canvasHeight - this.paddleHeight) / 2;
    this.roundStartTime = Date.now();
    this.lastUpdateCoords = this.getState();
    const objectInfo = {...this.lastUpdateCoords};
    objectInfo.ballSpeedX = 0;
    objectInfo.ballSpeedY = 0;
    this.nsp.to(this.id).emit('syncData', objectInfo);
  }

  gameStart() {
    this.gameStatus = GameStatus.COUNTDOWN;
    this.roundStartTime = Date.now();
    this.lastUpdate = this.roundStartTime;
    this.gameLoop();
    this.nsp.to(this.id).emit('gameStart', true);
  }

  isPlayer(uid: number): boolean {
    return this.p1 === uid || this.p2 === uid;
  }
  
  playerLeft(uid: number) {
    this.gameStatus = GameStatus.FINISHED;
    if (this.p1 === uid) {
      this.score[0] = -1;
    } else {
      this.score[1] = -1;
    }
  }
  
  upPress(uid: number) {
    if (this.gameStatus === GameStatus.RUNNING) {
      this.update();
      if (this.p1 === uid) {
        this.keyPress[0] = Date.now();
      } else {
        this.keyPress[2] = Date.now();
      }
      this.lastUpdateCoords = this.getState();
      this.nsp.to(this.id).emit("syncData", this.lastUpdateCoords);    }
  }
  
  upRelease(uid: number) {
    if (this.gameStatus === GameStatus.RUNNING) {
      this.update();
      if (this.p1 === uid) {
        this.keyPress[0] = 0;
      } else {
        this.keyPress[2] = 0;
      }
      this.lastUpdateCoords = this.getState();
      this.nsp.to(this.id).emit("syncData", this.lastUpdateCoords);    }
  }

  downPress(uid: number) {
    if (this.gameStatus === GameStatus.RUNNING) {
      this.update();
      if (this.p1 === uid) {
        this.keyPress[1] = Date.now();
      } else {
        this.keyPress[3] = Date.now();
      }
      this.lastUpdateCoords = this.getState();
      this.nsp.to(this.id).emit("syncData", this.lastUpdateCoords);    }
  }
  
  downRelease(uid: number) {
    if (this.gameStatus === GameStatus.RUNNING) {
      this.update();
      if (this.p1 === uid) {
        this.keyPress[1] = 0;
      } else {
        this.keyPress[3] = 0;
      }
      this.lastUpdateCoords = this.getState();
      this.nsp.to(this.id).emit("syncData", this.lastUpdateCoords);    }
  }

  // Event driven update
  private gameLoop() {
    if (this.gameStatus !== GameStatus.FINISHED) {
      const timeout = this.update();
      this.nsp.to(this.id).emit("syncData", this.lastUpdateCoords);
      setTimeout(this.gameLoop.bind(this), timeout);
    }
  }

  private isFinished(): boolean{
    return this.score[0] >= this.maxScore || this.score[1] >= this.maxScore;
  }

  private countdown(curTime: number): number {
    if (this.isFinished() === true) {
      this.gameStatus = GameStatus.FINISHED;
      return 100;
    } else if (curTime - this.roundStartTime >= 2000) {
      this.gameStatus = GameStatus.RUNNING;
      this.init();
      this.nsp.to(this.id).emit('countdown', true);
      return 100;
    }
    return 2000;
  }

  private getHitTime(): number {
    let hitPredictTimeX: number;
    let hitPredictTimeY: number;

    if (this.ballSpeedX > 0) {
      hitPredictTimeX = (this.canvasWidth - this.ballRadius - this.paddleWidth - this.ballX) / this.ballSpeedX;
    } else {
      hitPredictTimeX = (this.ballX - this.ballRadius - this.paddleWidth) / -this.ballSpeedX;
    }
    if (this.ballSpeedY > 0) {
      hitPredictTimeY = (this.canvasHeight - this.ballRadius - this.ballY) / this.ballSpeedY;
    } else if (this.ballSpeedY < 0) {
      hitPredictTimeY = (this.ballY - this.ballRadius) / -this.ballSpeedY;
    } else {
      hitPredictTimeY = Infinity;
    }
    if (hitPredictTimeX < hitPredictTimeY) {
      return hitPredictTimeX + 1;
    }
    return hitPredictTimeY + 1;
  }

  private hitP1Paddle(): void {
    if (this.keyPress[0] !== 0 && this.keyPress[1] === 0) {
      this.ballSpeedY -= this.paddleSpeed / 5;
      if (this.ballSpeedY < -this.ballSpeedMax) {
        this.ballSpeedY = -this.ballSpeedMax;
      }
    } else if (this.keyPress[0] === 0 && this.keyPress[1] !== 0) {
      this.ballSpeedY += this.paddleSpeed / 5;
      if (this.ballSpeedY > this.ballSpeedMax) {
        this.ballSpeedY = this.ballSpeedMax;
      }
    }
    this.ballX = 2 * (this.ballRadius + this.paddleWidth) - this.ballX;
    this.ballSpeedX = -this.ballSpeedX;
  }

  private hitP2Paddle() {
    if (this.keyPress[2] !== 0 && this.keyPress[3] === 0) {
      this.ballSpeedY -= this.paddleSpeed / 5;
      if (this.ballSpeedY < -this.ballSpeedMax) {
        this.ballSpeedY = -this.ballSpeedMax;
      }
    } else if (this.keyPress[2] === 0 && this.keyPress[3] !== 0) {
      this.ballSpeedY += this.paddleSpeed / 5;
      if (this.ballSpeedY > this.ballSpeedMax) {
        this.ballSpeedY = this.ballSpeedMax;
      }
    }
    this.ballX = 2 * (this.canvasWidth - this.ballRadius - this.paddleWidth) - this.ballX;
    this.ballSpeedX = -this.ballSpeedX;
  }

  private updateScore(i: number): number {
    this.gameStatus = GameStatus.COUNTDOWN;
    this.score[i]++;
    this.round++;
    this.nsp.to(this.id).emit("syncData", this.getState());
    this.nsp.to(this.id).emit("scoreInfo", {p1Score: this.score[0], p2Score: this.score[1]});
    return 2000;
  }

  private running(curTime: number): number {
    let timeout = 10;
    const dt = curTime - this.lastUpdate;
    if (dt > 0) {
      const keyPressTime = this.getKeyPressDt(curTime);
      this.paddleUpdate(keyPressTime);
      this.ballX += this.ballSpeedX * dt;
      this.ballY += this.ballSpeedY * dt;
      const isHitY = this.collisionCheckY();
      const isHitX = this.collisionCheckX();
      if (isHitY) {
        if (this.ballY < this.ballRadius) {
          this.ballY = 2 * this.ballRadius - this.ballY;
        } else {
          this.ballY = 2 * (this.canvasHeight - this.ballRadius) - this.ballY;
        }
        this.ballSpeedY = -this.ballSpeedY;
      }
      if (isHitX == Direction.LEFT) {
        if (this.collisionCheckP1Paddle() === Hit.PADDLE) {
          this.hitP1Paddle();
        } else {
          return this.updateScore(1);
        }
      } else if (isHitX === Direction.RIGHT) {
        if (this.collisionCheckP2Paddle() === Hit.PADDLE) {
          this.hitP2Paddle();
        } else {
          return this.updateScore(0);
        }
      }
      this.lastUpdateCoords = this.getState();
      timeout = this.getHitTime();
    }
    return timeout;
  }

  private disconnect(): number {
    const result = new GameEntity();
    if (this.score[0] < this.score[1]){
      result.winnerId = this.p2;
      result.loserId = this.p1;
      result.winnerScore = this.score[1];
      result.loserScore = this.score[0];
    } else {
      result.winnerId = this.p1;
      result.loserId = this.p2;
      result.winnerScore = this.score[0];
      result.loserScore = this.score[1];
    }
    result.gameType = GameType.PUBLIC;
    this.databaseService.saveGame(result);
    return 10;
  }

  private update(): number {
    const curTime = Date.now();
    let timeout:number
    switch(this.gameStatus) {
      case GameStatus.COUNTDOWN: {
        timeout = this.countdown(curTime);
        break;
      }
      case GameStatus.RUNNING: {
        timeout = this.running(curTime);
        break;
      }
      case GameStatus.FINISHED: {
        this.nsp.to(this.id).emit("finished", { p1: this.score[0], p2: this.score[1] });
        this.gameStatus = GameStatus.DISCONNECT;
        timeout = 1000;
        break;
      }
      case GameStatus.DISCONNECT: {
        timeout = this.disconnect();
        break;
      }
    }
    this.lastUpdate = curTime;
    // console.log(`[${Date.now()}] backend game login update`);
    return timeout;
  }
  
  private getKeyPressDt(curTime: number): number[] {
    const keyPressDt: number[] = [];
    for (let i = 0; i < 4; i++) {
      if (this.keyPress[i] !== 0 && curTime > this.keyPress[i]) {
        keyPressDt.push(curTime - this.keyPress[i]);
        this.keyPress[i] = curTime;
      } else {
        keyPressDt.push(0);
      }
    }
    return keyPressDt;
  }

  private paddleUpdate(keyPressDt: number[]) {
    if (keyPressDt[0] !== 0) {
      if (this.paddle1Y > 0){
        this.paddle1Y -= this.paddleSpeed * keyPressDt[0];
      }
      if (this.paddle1Y < 0) {
        this.paddle1Y = 0;
      }
    }
    if (keyPressDt[1] !== 0) {
      if (this.paddle1Y < this.canvasHeight - this.paddleHeight){
        this.paddle1Y += this.paddleSpeed * keyPressDt[1];
      }
      if (this.paddle1Y > this.canvasHeight - this.paddleHeight) {
        this.paddle1Y = this.canvasHeight - this.paddleHeight;
      }
    }
    if (keyPressDt[2] !== 0) {
      if (this.paddle2Y > 0) {
        this.paddle2Y -= this.paddleSpeed * keyPressDt[2];
      }
      if (this.paddle2Y < 0) {
        this.paddle2Y = 0;
      }
    }
    if (keyPressDt[3] !== 0) {
      if (this.paddle2Y < this.canvasHeight - this.paddleHeight){
        this.paddle2Y += this.paddleSpeed * keyPressDt[3];
      }
      if (this.paddle2Y > this.canvasHeight - this.paddleHeight) {
        this.paddle2Y = this.canvasHeight - this.paddleHeight;
      }
    }
  }

  private collisionCheckX() {
    if (this.ballX <= this.ballRadius + this.paddleWidth) {
      return Direction.LEFT;
    } else if (this.ballX >= this.canvasWidth - this.ballRadius - this.paddleWidth) {
      return Direction.RIGHT;
    }
    return Direction.NONE;
  }

  private collisionCheckY() {
    if (this.ballY >= this.canvasHeight - this.ballRadius) {
      return Direction.DOWN;
    } else if (this.ballY <= this.ballRadius) {
      return Direction.UP;
    }
    return Direction.NONE;
  }

  private collisionCheckP1Paddle() {
    if (this.ballY >= this.paddle1Y && this.ballY <= this.paddle1Y + this.paddleHeight) {
      return Hit.PADDLE;
    }
    return Hit.WALL;
  }

  private collisionCheckP2Paddle() {
    if (this.ballY >= this.paddle2Y && this.ballY <= this.paddle2Y + this.paddleHeight) {
      return Hit.PADDLE;
    }
    return Hit.WALL;
  }

  private getState(): GameCoords {
    return {
      paddle1Y: this.paddle1Y,
      ballX: this.ballX,
      ballY: this.ballY,
      paddle2Y: this.paddle2Y,
      ballSpeedX: this.ballSpeedX,
      ballSpeedY: this.ballSpeedY,
      paddleSpeed: this.paddleSpeed,
      keyPress: this.keyPress,
      time: Date.now(),
    };
  }

}
