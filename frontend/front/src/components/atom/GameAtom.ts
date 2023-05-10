import { atom } from "jotai";
// import type * as DTO from '../../socket/game.dto';

export const isQueueAtom = atom<boolean>(false);

export interface GameCoordinate {
  paddle1Y: number;
  ballX: number;
  ballY: number;
  paddle2Y: number;
  ballSpeedX: number;
  ballSpeedY: number;
  paddleSpeed: number;
  paddle1YUp: boolean;
  paddle1YDown: boolean;
  paddle2YUp: boolean;
  paddle2YDown: boolean;
  time: number;
  p1Score?: number;
  p2Score?: number;
}

// export const GameCoordinateAtom = atom<GameCoordinate>({
//   paddle1Y: 225,
//   ballX: 1150 / 2,
//   ballY: 300,
//   paddle2Y: 225,
//   ballSpeedX: 0,
//   ballSpeedY: 0,
//   paddleSpeed: 0.6,
//   paddle1YUp: false,
//   paddle1YDown: false,
//   paddle2YUp: false,
//   paddle2YDown: false,
// });

export const GameCanvas = atom<HTMLCanvasElement | null>(null);
