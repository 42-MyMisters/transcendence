import { atom, createStore } from "jotai";
import type * as DTO from '../../socket/chat.dto';


export const roomListAtom = atom<DTO.roomListDto>({});
export const userListAtom = atom<DTO.userDto>({});
export const userHistoryAtom = atom<DTO.userDto>({});

export const dmHistoryListAtom = atom<DTO.userDto>({});
export const followingListAtom = atom<DTO.userDto>({});
export const userBlockListAtom = atom<DTO.userSimpleDto>({});

export const hasLoginAtom = atom<boolean>(false);
export const isFirstLoginAtom = atom<boolean>(true);
export const focusRoomAtom = atom<number>(-1);
export const clickRoomAtom = atom<number>(-1);
export const socketStateAtom = atom<boolean>(false);


