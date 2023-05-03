import { atom, createStore } from "jotai";
// import type * as DTO from '../../socket/game.dto';

export const isQueueAtom = atom<boolean>(false);

export interface GameCoordinate {
  leftY: number;
  ballX: number;
  ballY: number;
  rightY: number;
}

export const GameCoordinateAtom = atom<GameCoordinate>({
  leftY: 225,
  ballX: 500,
  ballY: 300,
  rightY: 225,
});
