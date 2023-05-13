import { atom } from "jotai";
// import type * as DTO from '../../socket/game.dto';

export const isLoadingAtom = atom<boolean>(false);

export const isPrivateAtom = atom<boolean>(false);

export const isGameStartedAtom = atom<boolean>(false);

// init value: 2000
export const serverClientTimeDiffAtom = atom<number>(2000);
