import { atom, createStore } from "jotai";
import { userItem } from '../../socket/chatting.dto';
import type { perUserItemDto } from '../../socket/chatting.dto';


export const dtoChatInfoAtom = atom<perUserItemDto>(userItem);
export const hasLoginAtom = atom<boolean>(false);

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
