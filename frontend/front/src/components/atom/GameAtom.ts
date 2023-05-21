import { atom } from "jotai";
import { io, Socket } from "socket.io-client";
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

export const gameinviteFromAtom = atom<number>(-1);

const URL = "https://localhost";
const NameSpace = "/game";

export const gameSocketAtom = atom<Socket>(io(`${URL}${NameSpace}`, {
	auth: {},
	autoConnect: false,
	transports: ["polling", "websocket"],
	secure: true,
	upgrade: true,
}));