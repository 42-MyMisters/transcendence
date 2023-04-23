import { atom, createStore } from "jotai";
import { userItem } from '../../socket/chatting.dto';
import type * as DTO from '../../socket/chatting.dto';


export const userListAtom = atom<DTO.userDto[]>([]);
export const roomListAtom = atom<DTO.roomDto[]>([]);
export const joinRoomListAtom = atom<DTO.joinRoomDto[]>([]);
export const hasLoginAtom = atom<boolean>(false);
export const focusRoomAtom = atom<string>('');

// export const socketFirstTouch = atom<boolean>(false);
// export const storeSocketInit = createStore();

// storeSocketInit.set(socketFirstTouch, false);

// export const readWriteAtom = atom(
// 	(get) => {
// 		get(socketFirstTouch)
// 	},
// 	(get, set, newState: boolean) => {
// 		set(socketFirstTouch, newState)
// 	}
// )
