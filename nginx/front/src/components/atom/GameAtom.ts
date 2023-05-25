import { atom } from "jotai";
import { io, Socket } from "socket.io-client";

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

type gameMode = 'normal' | 'item';

export const gameModeAtom = atom<gameMode>('normal');

<<<<<<< HEAD:frontend/front/src/components/atom/GameAtom.ts
const URL = "https://wchaeserver.mooo.com";
=======
const URL = process.env.REACT_APP_API_URL;
>>>>>>> 9e630b5be567f65ad1493b8992e2a1a490c4bc42:nginx/front/src/components/atom/GameAtom.ts
const NameSpace = "/game";

export const gameSocketAtom = atom<Socket>(io(`${URL}${NameSpace}`, {
	auth: {},
	autoConnect: false,
	transports: ["polling", "websocket"],
	// secure: true,
	upgrade: true,
	path: "/socket.io/game"
}));

export const enum GamePlayer {
	undefined = 0,
	player1 = 1,
	player2 = 2,
	observer = 3,
}

export const enum GameMode {
	DEFAULT = 0,
	SPEED = 1,
}

export const gamePlayerAtom = atom<GamePlayer>(GamePlayer.player1);

export const gameWinnerAtom = atom<number>(0);

export const gameModeForDisplayAtom = atom<GameMode>(GameMode.DEFAULT);

export const p1IdAtom = atom<number>(-1);

export const p2IdAtom = atom<number>(-1);

