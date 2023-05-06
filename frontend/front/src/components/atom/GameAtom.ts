import { time } from "console";
import { atom, createStore } from "jotai";
// import type * as DTO from '../../socket/game.dto';

export const isQueueAtom = atom<boolean>(false);

export interface GameCoordinate {
  paddle1Y: number;
  ballX: number;
  ballY: number;
  paddle2Y: number;
  ballSpeedX: number;
  ballSpeedY: number;
}

export const GameCoordinateAtom = atom<GameCoordinate>({
  paddle1Y: 225,
  ballX: 1150 / 2,
  ballY: 300,
  paddle2Y: 225,
  ballSpeedX: 0,
  ballSpeedY: 0,
});

export const GameCanvas = atom<HTMLCanvasElement | null>(null);
