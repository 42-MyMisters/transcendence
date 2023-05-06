import { atom, useAtom } from "jotai";

interface UserInfoModalInfoType {
  uid: number;
  nickName: string;
  isFollow: boolean;
  userState: string;
  profileImage: string;
  isIgnored: boolean;
  userPower: string;
}

export const UserInfoModalInfo = atom<UserInfoModalInfoType>({
  uid: 0,
  nickName: "NickName",
  isFollow: false,
  userState: "online",
  profileImage: '/smile.png',
  isIgnored: false,
  userPower: "owner",
});
