import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Namespace } from "socket.io";
import { DatabaseService } from "src/database/database.service";
import { Direction, GameMode, GameStatus, WallX } from "./game.enum";

@Injectable()
export class GameService {
  private games: Map<string, Game>;
  constructor(private readonly databaseService: DatabaseService) {
    this.games = new Map<string, Game>();
  }

  createGame(gameId: string, nsp: Namespace, p1Id: number, p2Id: number) {
    try {
      this.games.set(
        gameId,
        new Game(gameId, nsp, p1Id, p2Id, this.databaseService),
      );
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
  private gameStatus: GameStatus;
  private gameMode: GameMode;
  private gameModeTmp: GameMode;

  private roundStartTime: number;
  private roundTime: number;
  private prevTime: number;

  private p1Score: number;
  private p2Score: number;
  private p1KeyUp: boolean;
  private p2KeyUp: boolean;
  private p1KeyDown: boolean;
  private p2KeyDown: boolean;

  constructor(
    private readonly id: string,
    private readonly nsp: Namespace,
    private readonly p1: number,
    private readonly p2: number,
    private readonly databaseService: DatabaseService,
    // Fixed param set
    private readonly fps = 1000 / 100,
    private readonly canvasWidth = 1150,
    private readonly canvasHeight = 600,
    private readonly ballRadius = 15,
    private readonly paddleHeight = 150,
    private readonly paddleWidth = 30,
    private readonly paddleSpeed = 10,
    private readonly paddleSpeedMax = canvasHeight / 20,
    private readonly maxScore = 5,
  ) {
    this.running = true;
    // countdown time 3sec
    this.p1Score = 0;
    this.p2Score = 0;
    this.init();
  }

  isRunning() {
    return this.running;
  }

  gameState() {
    return this.gameStatus;
  }

  init() {
    this.ballX = this.canvasWidth / 2;
    this.ballY = this.canvasHeight / 2;
    if (Math.random() >= 0.5) {
      this.ballSpeedX = this.canvasWidth / 80 / 2;
    } else {
      this.ballSpeedX = -this.canvasWidth / 80 / 2;
    }
    this.ballSpeedY = 0;
    // this.ballSpeedY = Math.random() * 10 - 5;
    this.paddle1Y = this.canvasHeight / 2;
    this.paddle2Y = this.canvasHeight / 2;
    this.p1KeyUp = false;
    this.p2KeyUp = false;
    this.p1KeyDown = false;
    this.p2KeyDown = false;
  }

  gameStart() {
    this.gameStatus = GameStatus.COUNTDOWN;
    this.roundStartTime = Date.now();
    this.prevTime = this.roundStartTime;
    const interval = setInterval(() => {
      this.update();
      if (this.gameState() == GameStatus.FINISHED) {
        // save data to db
        // this.databaseService.save
        clearInterval(interval);
      }
    }, this.fps);
  }

  update() {

    const curTime = Date.now();
    if (this.gameState() !== GameStatus.FINISHED) {
      if (this.isRunning() === true) {
        this.paddleUpdate();
        this.ballX += this.ballSpeedX;
        this.ballY += this.ballSpeedY;
        const isHitY = this.collisionCheckY();
        const isHitX = this.collisionCheckX();
        if (isHitY) {
          if (this.ballY < this.ballRadius) {
            this.ballY = 2 * this.ballRadius - this.ballY;
            this.ballSpeedY = -this.ballSpeedY;
          } else {
            this.ballY = 2 * (this.canvasHeight - this.ballRadius) - this.ballY;
            this.ballSpeedY = -this.ballSpeedY;
          }
        }
        if (isHitX == Direction.LEFT) {
          if (this.collisionCheckP1Paddle() === WallX.PADDLE) {
            this.ballX = 2 * (this.ballRadius + this.paddleWidth) - this.ballX;
            this.ballSpeedX = -this.ballSpeedX;
          } else {
            console.log("p2 scored");
            this.p2Score++;
            this.nsp.to(this.id).emit("graphic", this.getState());
            this.init();
          }
        } else if (isHitX === Direction.RIGHT) {
          if (this.collisionCheckP2Paddle() === WallX.PADDLE) {
            this.ballX =
              2 * (this.canvasWidth - this.ballRadius - this.paddleWidth) -
              this.ballX;
            this.ballSpeedX = -this.ballSpeedX;
          } else {
            console.log("p1 scored");
            this.p1Score++;
            this.nsp.to(this.id).emit("graphic", this.getState());
            this.init();
          }
        }
        // console.log(`update: id: ${this.id}, ingame time: ${this.roundTime}, time from start: ${Date.now() - this.now}, data: ${JSON.stringify(this.getState())}`);
        this.nsp.to(this.id).emit("graphic", this.getState());
      }
    } else {
      if (this.p1Score > this.p2Score) {
        console.log("p1 win");
      } else {
        console.log("p2 win");
      }
      this.nsp
        .to(this.id)
        .emit("finished", { p1: this.p1Score, p2: this.p2Score });
      this.running = false;
    }
    this.prevTime = curTime;
  }

  paddleUpdate() {
    if (this.p1KeyUp) {
      if (this.paddle1Y > this.paddleHeight / 2) {
        this.paddle1Y -= this.paddleSpeed;
        if (this.paddle1Y < this.paddleHeight / 2) {
          this.paddle1Y = this.paddleHeight / 2;
        }
      }
    }
    if (this.p2KeyUp) {
      if (this.paddle2Y > this.paddleHeight / 2) {
        this.paddle2Y -= this.paddleSpeed;
        if (this.paddle2Y < this.paddleHeight / 2) {
          this.paddle2Y = this.paddleHeight / 2;
        }
      }
    }
    if (this.p1KeyDown) {
      if (this.paddle1Y < this.canvasHeight - this.paddleHeight / 2) {
        this.paddle1Y += this.paddleSpeed;
        if (this.paddle1Y > this.canvasHeight - this.paddleHeight / 2) {
          this.paddle1Y = this.canvasHeight - this.paddleHeight / 2;
        }
      }
    }
    if (this.p2KeyDown) {
      if (this.paddle2Y < this.canvasHeight - this.paddleHeight / 2) {
        this.paddle2Y += this.paddleSpeed;
        if (this.paddle2Y > this.canvasHeight - this.paddleHeight / 2) {
          this.paddle2Y = this.canvasHeight - this.paddleHeight / 2;
        }
      }
    }
  }

  collisionCheckX() {
    if (this.ballX < this.ballRadius + this.paddleWidth) {
      return Direction.LEFT;
    } else if (
      this.ballX >
      this.canvasWidth - this.ballRadius - this.paddleWidth
    ) {
      return Direction.RIGHT;
    }
    return Direction.NONE;
  }

  collisionCheckY() {
    if (this.ballY > this.canvasHeight - this.ballRadius) {
      return Direction.DOWN;
    } else if (this.ballY < this.ballRadius) {
      return Direction.UP;
    }
    return Direction.NONE;
  }

  collisionCheckP1Paddle() {
    if (
      this.ballY >= this.paddle1Y - this.paddleHeight / 2 &&
      this.ballY <= this.paddle1Y + this.paddleHeight / 2
    ) {
      return WallX.PADDLE;
    }
    return WallX.WALL;
  }

  collisionCheckP2Paddle() {
    if (
      this.ballY >= this.paddle2Y - this.paddleHeight / 2 &&
      this.ballY <= this.paddle2Y + this.paddleHeight / 2
    ) {
      return WallX.PADDLE;
    }
    return WallX.WALL;
  }

  getState() {
    return {
      leftY: this.paddle1Y,
      ballX: this.ballX,
      ballY: this.ballY,
      rightY: this.paddle2Y,
      time: Date.now(),
    };
  }

  isPlayer(uid: number): boolean {
    return this.p1 === uid || this.p2 === uid;
  }

  upPress(uid: number) {
    if (this.p1 === uid) {
      this.p1KeyUp = true;
    } else {
      this.p2KeyUp = true;
    }
    // console.log("up pressed");
  }

  upRelease(uid: number) {
    if (this.p1 === uid) {
      this.p1KeyUp = false;
    } else {
      this.p2KeyUp = false;
    }
    // console.log("up released");
  }
  downPress(uid: number) {
    if (this.p1 === uid) {
      this.p1KeyDown = true;
    } else {
      this.p2KeyDown = true;
    }
    // console.log("down press");
  }

  downRelease(uid: number) {
    if (this.p1 === uid) {
      this.p1KeyDown = false;
    } else {
      this.p2KeyDown = false;
    }
    // console.log("down released");
  }

  playerLeft(uid: number) {
    this.running = false;
    if (this.p1 === uid) {
      this.p1Score = -1;
    } else {
      this.p2Score = -1;
    }
  }
}
