import { atom, useAtom } from "jotai";

interface UserInfoModalInfo {
  nickName: string;
  isFollow: boolean;
  userState: string;
  isIgnored: boolean;
  myPower: string;
  userId: number;
}

export const UserInfoModalInfo = atom<UserInfoModalInfo>({
  nickName: "NickName",
  isFollow: false,
  userState: "online",
  isIgnored: false,
  myPower: "owner",
  userId: 0,
});
