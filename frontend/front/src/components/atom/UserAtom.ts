import { atom } from "jotai";

interface UserType {
  uid: number,
  nickname: string;
  profileUrl: string;
  ELO: number;
  tfaEnabled: boolean;
}

interface FollowingsType {
  uid: number;
  nickname: string;
  profileUrl: string;
  createdAt: string;
}

interface GameRecordType {
  gid: number;
  winnerUid: number;
  loserUid: number;
  winnerScore: number;
  loserScore: number;
  winnerNickname: string;
  loserNickname: string;
  createdAt: string;
}

export const TFAAtom = atom<boolean>(false);
export const isMyProfileAtom = atom<boolean>(true);

export const ProfileAtom = atom<UserType>({} as UserType);
export const FollowingAtom = atom<FollowingsType[]>([{} as FollowingsType]);
export const GameRecordAtom = atom<GameRecordType[]>([{} as GameRecordType]);

export const UserAtom = atom<UserType>({
  uid: 1,
  nickname: "Smile",
  profileUrl: "/smile.png",
  ELO: 1000,
  tfaEnabled: false,
});

export type { UserType, FollowingsType, GameRecordType };
