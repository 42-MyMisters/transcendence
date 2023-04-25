import { atom, createStore } from "jotai";
import type * as DTO from '../../socket/chatting.dto';


export const roomListAtom = atom<DTO.roomListDto>({});
export const userListAtom = atom<DTO.userDto>({});
export const dmHistoryListAtom = atom<DTO.userDto>({});
export const userBlockListAtom = atom<DTO.userSimpleDto>({});
// export const dmListAtom = atom<DTO.userDto[]>([]);
// export const followingListAtom = atom<DTO.userDto[]>([]);

export const hasLoginAtom = atom<boolean>(false);
export const isFirstLoginAtom = atom<boolean>(true);
export const focusRoomAtom = atom<number>(-1);

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
