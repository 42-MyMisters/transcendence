import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class GameService {
	
  constructor(id: string) {
    this.id = id;
    this.ballX = 50;
    this.ballY = 50;
    this.paddle1Y = 250;
    this.paddle2Y = 250;
    this.running = true;
  }

  private id: string;
  private ballX: number;
  private ballY: number;
  private paddle1Y: number;
  private paddle2Y: number;
  private running: boolean;


  isRunning() {
    return this.running;
  }

  update() {
    // 게임 로직 처리
  }

  getState() {
    return {
      ballX: this.ballX,
      ballY: this.ballY,
      paddle1Y: this.paddle1Y,
      paddle2Y: this.paddle2Y,
      // 게임 상태 반환
    };
  }
}
