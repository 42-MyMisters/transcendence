import { atom, createStore } from "jotai";
import type * as DTO from '../../socket/chat.dto';

export const needToLogout = atom<boolean>(false);
export const roomListAtom = atom<DTO.roomListDto>({});
export const userListAtom = atom<DTO.userDto>({});

export const dmHistoryListAtom = atom<DTO.userDto>({});
export const followingListAtom = atom<DTO.userDto>({});
export const blockListAtom = atom<DTO.userSimpleDto>({});

export const hasLoginAtom = atom<boolean>(false);
export const isFirstLoginAtom = atom<boolean>(true);
export const focusRoomAtom = atom<number>(-1);
export const clickRoomAtom = atom<number>(-1);
export const socketStateAtom = atom<boolean>(false);

export const roomSettingAtom = atom<boolean>(false);
export const roomSettingIsPrivateAtom = atom<boolean>(false);
export const roomSettingCurrentRoomNameAtom = atom<string>('');
export const adminConsoleAtom = atom<boolean>(true);
