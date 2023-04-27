import { Injectable } from '@nestjs/common';

@Injectable()
export class GameService {
  private games = new Map<number, Game>();

  createGame(gameId: number) {
    const game = new Game(gameId);
    this.games.set(gameId, game);
  }

  getGame(gameId: number) {
    return this.games.get(gameId);
  }

  deleteGame(gameId: number) {
    this.games.delete(gameId);
  }
}

class Game {
  private readonly canvasWidth = 600;
  private readonly canvasHeight = 400;
  private readonly ballRadius = 10;
  private readonly paddleHeight = 100;
  private readonly paddleWidth = 10;
  private readonly paddleSpeed = 10;
  private id: number;
  private ballX: number;
  private ballY: number;
  private ballSpeedX = 5;
  private ballSpeedY = 0;
  private paddle1Y: number;
  private paddle2Y: number;
  private running: boolean;
  
  constructor(id: number) {
    this.id = id;
    this.ballX = 50;
    this.ballY = 50;
    this.paddle1Y = 250;
    this.paddle2Y = 250;
    this.running = true;
  }

  isRunning() {
    return this.running;
  }

  update() {
    
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