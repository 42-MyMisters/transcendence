import { atom } from "jotai";

export interface GameCoordinate {
  leftY: number;
  ballX: number;
  ballY: number;
  rightY: number;
}

export const GameCoordinateAtom = atom<GameCoordinate>({
  leftY: 300,
  ballX: 500,
  ballY: 300,
  rightY: 300,
});
