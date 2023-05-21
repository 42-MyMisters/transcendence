import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { Namespace } from "socket.io";
import { DatabaseService } from "src/database/database.service";
import { Direction, GameMode, GameStatus, GameType, Hit } from "./game.enum";
import { Game as GameEntity } from "../database/entity/game.entity";
import { GameInfo } from "./game.gateway";

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

export interface GameStartVar {
  gameId: string,
  server: Namespace,
  p1: number,
  p2: number,
  p1Elo: number,
  p2Elo: number,
  gameType: GameType,
}

@Injectable()
export class GameService {
  private games: Map<string, Game>;
  constructor(private readonly databaseService: DatabaseService) {
    this.games = new Map<string, Game>();
  }
  
  createGame(gv: GameStartVar) {
    try {
      const curGame = new Game(gv, this.databaseService, this.games);
      this.games.set(gv.gameId, curGame);
      curGame.gameStart();
      console.log(`game started!!!!`);
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

  gameState(gameId: string) {
    const game = this.games.get(gameId);
    if (game !== undefined) {
      return game.getStatus();
    }
    return GameStatus.FINISHED;
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
    private readonly gv: GameStartVar,
    private readonly databaseService: DatabaseService,
    private readonly games: Map<string, Game>,
    // Fixed param set
    private readonly canvasWidth = 1150,
    private readonly canvasHeight = 600,
    private readonly ballRadius = 15,
    private readonly paddleHeight = 150,
    private readonly paddleWidth = 30,
    private readonly paddleSpeed = 0.8,
    private readonly maxScore = 5,
    ) {
    // this.score[0] = this.score[1] = 0;
    this.round = 0;
    this.gameMode = GameMode.DEFAULT;
  }

  private init() {
    switch (this.gameMode) {
      case GameMode.DEFAULT: {
        this.ballSpeedMultiplier = 1.4;
        break;
      }
      case GameMode.SPEED: {
        this.ballSpeedMultiplier = 2;
        break;
      }
    }
    this.ballSpeedMax = this.canvasWidth / 2000 * this.ballSpeedMultiplier;
    this.ballX = this.canvasWidth / 2;
    this.ballY = this.canvasHeight / 2;
    this.ballSpeedX = this.ballSpeedMax;
    if (Math.random() >= 0.5) {
      this.ballSpeedX = -this.ballSpeedX;
    }
    // +-26.5 degree range.
    this.ballSpeedY = this.ballSpeedX * 0.7 * (Math.random() * 2 - 1);
    this.ballSpeedY = 0;
    for (let i = 0; i < 4; i++) {
      this.keyPress[i] = 0;
    }
    this.paddle1Y = this.paddle2Y = (this.canvasHeight - this.paddleHeight) / 2;
    this.roundStartTime = Date.now();
    this.lastUpdateCoords = this.curState(this.roundStartTime);
    const objectInfo = {...this.lastUpdateCoords};
    objectInfo.ballSpeedX = 0;
    objectInfo.ballSpeedY = 0;
    this.gv.server.to(this.gv.gameId).emit('syncData', objectInfo);
  }

  gameStart() {
    this.gameStatus = GameStatus.MODESELECT;
    this.roundStartTime = Date.now();
    this.gv.server.to(this.gv.gameId).emit('matched', { p1: this.gv.p1, p2: this.gv.p2 });
    this.gameLoop();
  }
  
  modeSelect(curTime: number) {
    if (curTime - this.roundStartTime >= 5000) {
      this.gameStatus = GameStatus.COUNTDOWN;
      this.roundStartTime = Date.now();
      this.lastUpdate = this.roundStartTime;
      console.log(`gameStart emit. gameMode: ${this.gameMode}!!!!!!`);
      this.gv.server.to(this.gv.gameId).emit('gameStart');
      return 1;
    }
    return 5000 - curTime + this.roundStartTime;
  }

  isPlayer(uid: number): boolean {
    return this.gv.p1 === uid || this.gv.p2 === uid;
  }
  

  isP1(uid: number): boolean {
    return this.gv.p1 === uid;
  }
  
  playerLeft(uid: number) {
    if (this.gameStatus <= GameStatus.RUNNING) {
      if (this.gv.p1 === uid) {
        this.score[0] = -1;
      } else {
        this.score[1] = -1;
      }
      this.gameStatus = GameStatus.FINISHED;
    }
  }
  
  upPress(uid: number) {
    if (this.gameStatus === GameStatus.RUNNING) {
      this.update();
      if (this.gv.p1 === uid) {
        this.keyPress[0] = Date.now();
      } else {
        this.keyPress[2] = Date.now();
      }
      this.lastUpdateCoords = this.curState(this.lastUpdateCoords.time);
      this.gv.server.to(this.gv.gameId).emit("syncData", this.lastUpdateCoords);
    }
  }
  
  upRelease(uid: number) {
    if (this.gameStatus === GameStatus.RUNNING) {
      this.update();
      if (this.gv.p1 === uid) {
        this.keyPress[0] = 0;
      } else {
        this.keyPress[2] = 0;
      }
      this.lastUpdateCoords = this.curState(this.lastUpdateCoords.time);
      this.gv.server.to(this.gv.gameId).emit("syncData", this.lastUpdateCoords);
    }
  }

  downPress(uid: number) {
    if (this.gameStatus === GameStatus.RUNNING) {
      this.update();
      if (this.gv.p1 === uid) {
        this.keyPress[1] = Date.now();
      } else {
        this.keyPress[3] = Date.now();
      }
      this.lastUpdateCoords = this.curState(this.lastUpdateCoords.time);
      this.gv.server.to(this.gv.gameId).emit("syncData", this.lastUpdateCoords);
    }
  }
  
  downRelease(uid: number) {
    if (this.gameStatus === GameStatus.RUNNING) {
      this.update();
      if (this.gv.p1 === uid) {
        this.keyPress[1] = 0;
      } else {
        this.keyPress[3] = 0;
      }
      this.lastUpdateCoords = this.curState(this.lastUpdateCoords.time);
      this.gv.server.to(this.gv.gameId).emit("syncData", this.lastUpdateCoords);
    }
  }

  setMode(mode: GameMode) {
    console.log(`setMode!!!!!!!!!!!! mode: ${mode}`);
    if (this.gameStatus === GameStatus.MODESELECT) {
      console.log(`setMode!!!!!!!!!!!! mode: ${mode}`);
      this.gameMode = mode;
      console.log(`setMode!!!!!!!!!!!! gameMode: ${this.gameMode}`);
    }
  }

  getStatus(): GameStatus {
    return this.gameStatus;
  }

  gameInfo(): GameInfo {
    return {
      gameMode: this.gameMode,
      p1: this.gv.p1,
      p2: this.gv.p2,
    }
  }

  // Event driven update
  private async gameLoop() {
    // const timestamp = performance.now();
    const timestamp = Date.now();
    const timeout = await this.update();
    console.log(`update time: ${Date.now() - timestamp}`);
    // console.log(`update time: ${performance.now() - timestamp}`);
    if (this.gameStatus === GameStatus.RUNNING) {
      this.gv.server.to(this.gv.gameId).emit("syncData", this.lastUpdateCoords);
    }
    if (timeout !== -1) {
      setTimeout(this.gameLoop.bind(this), timeout);
    } else {
      this.games.delete(this.gv.gameId);
    }
  }

  private isFinished(): boolean{
    return this.score[0] >= this.maxScore || this.score[1] >= this.maxScore;
  }

  private countdown(curTime: number): number {
    if (this.isFinished() === true) {
      this.gameStatus = GameStatus.FINISHED;
      return 100;
    } else if (curTime - this.roundStartTime >= 3000) {
      this.gameStatus = GameStatus.RUNNING;
      console.log(`game mode: ${this.gameMode}`);
      this.init();
      // this.gv.server.to(this.gv.gameId).emit('countdown', true);
      return 100;
    }
    this.gv.server.to(this.gv.gameId).emit('countdown', true);
    return curTime - this.roundStartTime + 3000;
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

  private hitP1Paddle() {
    this.ballX = 2 * (this.ballRadius + this.paddleWidth) - this.ballX;
    switch (this.gameMode) {
      case GameMode.DEFAULT: {
        this.ballSpeedX = -this.ballSpeedX;
        break;
      }
      case GameMode.SPEED: {
        // 3% faster
        if (this.ballSpeedMax < this.canvasWidth / 800) {
          this.ballSpeedMax *= 1.08;
        }
        this.ballSpeedX = this.ballSpeedMax;
        break;
      }
    }
    if (this.keyPress[0] !== 0 && this.keyPress[1] === 0) {
      this.ballSpeedY -= this.ballSpeedMax / 2;
      if (this.ballSpeedY < -this.ballSpeedMax) {
        this.ballSpeedY = -this.ballSpeedMax;
      }
    } else if (this.keyPress[0] === 0 && this.keyPress[1] !== 0) {
      this.ballSpeedY += this.ballSpeedMax / 2;
      if (this.ballSpeedY > this.ballSpeedMax) {
        this.ballSpeedY = this.ballSpeedMax;
      }
    }
  }
  
  private hitP2Paddle() {
    this.ballX = 2 * (this.canvasWidth - this.ballRadius - this.paddleWidth) - this.ballX;
    switch (this.gameMode) {
      case GameMode.DEFAULT: {
        this.ballSpeedX = -this.ballSpeedX;
        break;
      }
      case GameMode.SPEED: {
        // 3% faster
        if (this.ballSpeedMax < this.canvasWidth / 800) {
          this.ballSpeedMax *= 1.08;
        }
        this.ballSpeedX = -this.ballSpeedMax;
        break;
      }
    }
    if (this.keyPress[2] !== 0 && this.keyPress[3] === 0) {
      this.ballSpeedY -= this.ballSpeedMax / 2;
      if (this.ballSpeedY < -this.ballSpeedMax) {
        this.ballSpeedY = -this.ballSpeedMax;
      }
    } else if (this.keyPress[2] === 0 && this.keyPress[3] !== 0) {
      this.ballSpeedY += this.ballSpeedMax / 2;
      if (this.ballSpeedY > this.ballSpeedMax) {
        this.ballSpeedY = this.ballSpeedMax;
      }
    }
  }
  
  private updateScore(i: number, time: number): number {
    this.gameStatus = GameStatus.COUNTDOWN;
    this.score[i]++;
    this.round++;
    this.lastUpdateCoords = this.curState(time);
    for(let i = 0; i < 4; i++) {
      this.lastUpdateCoords.keyPress[i] = 0;
    }
    // this.gv.server.to(this.gv.gameId).emit("syncData", this.lastUpdateCoords);
    this.gv.server.to(this.gv.gameId).emit("scoreInfo", {gameCoord: this.lastUpdateCoords, scoreInfo: {p1Score: this.score[0], p2Score: this.score[1]}});
    return 3000;
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
      if (isHitY !== Direction.NONE) {
        if (isHitY === Direction.UP) {
          this.ballY = 2 * this.ballRadius - this.ballY;
        } else {
          this.ballY = 2 * (this.canvasHeight - this.ballRadius) - this.ballY;
        }
        this.ballSpeedY = -this.ballSpeedY;
      }
      if (isHitX !== Direction.NONE) {
        if (isHitX == Direction.LEFT) {
          if (this.collisionCheckP1Paddle() === Hit.PADDLE) {
            this.hitP1Paddle();
          } else {
            return this.updateScore(1, curTime);
          }
        } else {
          if (this.collisionCheckP2Paddle() === Hit.PADDLE) {
            this.hitP2Paddle();
          } else {
            return this.updateScore(0, curTime);
          }
        }
      }
      this.lastUpdateCoords = this.curState(curTime);
      timeout = this.getHitTime();
    }
    return timeout;
  }

  private async disconnect(): Promise<number> {
    const result = new GameEntity();
    let winnerElo: number
    let loserElo: number;
    if (this.score[0] < this.score[1]){
      result.winnerId = this.gv.p2;
      result.loserId = this.gv.p1;
      result.winnerScore = this.score[1];
      result.loserScore = this.score[0];
      winnerElo = this.gv.p2Elo;
      loserElo = this.gv.p1Elo;
    } else {
      result.winnerId = this.gv.p1;
      result.loserId = this.gv.p2;
      result.winnerScore = this.score[0];
      result.loserScore = this.score[1];
      winnerElo = this.gv.p1Elo;
      loserElo = this.gv.p2Elo;
    }
    result.gameType = this.gv.gameType;
    await this.databaseService.saveGame(result);
    if (this.gv.gameType === GameType.PUBLIC) {
      const newElo = this.eloLogic(winnerElo, loserElo);
      console.log(newElo);
      await this.databaseService.updateUserElo(result.winnerId, newElo.winnerElo);
      await this.databaseService.updateUserElo(result.loserId, newElo.loserElo);
    }
    this.gv.server.in(this.gv.gameId).disconnectSockets();
    return -1;
  }

  private async update(): Promise<number> {
    const curTime = Date.now();
    let timeout:number
    switch(this.gameStatus) {
      case GameStatus.MODESELECT: {
        timeout = this.modeSelect(curTime);
        break;
      }
      case GameStatus.COUNTDOWN: {
        timeout = this.countdown(curTime);
        break;
      }
      case GameStatus.RUNNING: {
        timeout = this.running(curTime);
        break;
      }
      case GameStatus.FINISHED: {
        console.log("finished!!!!!");
        this.gv.server.to(this.gv.gameId).emit("finished", {p1Score: this.score[0], p2Score: this.score[1]});
        this.gameStatus = GameStatus.DISCONNECT;
        timeout = 1000;
        break;
      }
      case GameStatus.DISCONNECT: {
        timeout = await this.disconnect();
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

  private curState(time: number): GameCoords {
    return {
      paddle1Y: this.paddle1Y,
      ballX: this.ballX,
      ballY: this.ballY,
      paddle2Y: this.paddle2Y,
      ballSpeedX: this.ballSpeedX,
      ballSpeedY: this.ballSpeedY,
      paddleSpeed: this.paddleSpeed,
      keyPress: this.keyPress,
      time: time,
    };
  }


  private expectRating(myElo: number, opElo: number) {
    // 예상승률 =  1 /  ( 1 +  10 ^ ((상대레이팅점수 - 나의 현재 레이팅점수 ) / 400) )
    const rate = 400;
    const exponent = (opElo - myElo) / rate;
    const probability = 1 / (1 + Math.pow(10, exponent));
    return probability;
  }

  private newRating(myElo: number, opElo: number, isWin: boolean) {
    const K = 32;
    // rounded value
    if (isWin) {
      return Math.round(myElo + K  * (1 - this.expectRating(myElo, opElo)));
    } else {
      return Math.round(myElo + K  * (0 - this.expectRating(myElo, opElo)));
    }
  }

  private eloLogic(winnerElo: number, loserElo: number): { winnerElo: number, loserElo: number } {
    // Rn =  Ro +  K  (  W      -    We    )
    // 레이팅점수   =  현재레이팅점수  +   상수  ( 경기결과  -    예상승률 )
    // we =  1  / ( 1 +  10^  (( Rb - Ra  ) / 400) )    
    return { winnerElo: this.newRating(winnerElo, loserElo, true), loserElo: this.newRating(loserElo, winnerElo, false) };
  }

}
