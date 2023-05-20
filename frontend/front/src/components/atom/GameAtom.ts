import { atom } from "jotai";
// import type * as DTO from '../../socket/game.dto';

export const isLoadingAtom = atom<boolean>(false);

export const isMatchedAtom = atom<boolean>(false);

export const isPrivateAtom = atom<boolean>(false);

export const isGameStartedAtom = atom<boolean>(false);

export const isGameQuitAtom = atom<boolean>(false);

type gameInviteInfo = {
	gameType: 'queue' | 'invite' | 'observe';
	userId: number;
}

export const gameInviteInfoAtom = atom<gameInviteInfo>({ gameType: 'queue', userId: - 1 });

export const gameInviteCheckAtom = atom<number>(-1);
