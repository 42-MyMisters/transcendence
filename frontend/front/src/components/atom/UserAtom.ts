import { atom, useAtom } from "jotai";

interface UserType {
  uid: number;
  nickname: string;
  profileUrl: string;
  ELO: number;
  followings: {
    uid: number;
    nickname: string;
    profileUrl: string;
    status: string;
    createdAt: string;
    followings: [string];
  }[];
  games: {
    gid: number;
    winner: {
      uid: number;
      password: string;
      email: string;
      nickname: string;
      refreshToken: string;
      profileUrl: string;
      twoFactorEnabled: true;
      twoFactorSecret: string;
      followers: {
        fromUserId: number;
        targetToFollowId: number;
        fromUser: string;
        targetToFollow: string;
        createdAt: string;
      }[];
      followings: {
        fromUserId: number;
        targetToFollowId: number;
        fromUser: string;
        targetToFollow: string;
        createdAt: string;
      }[];
      wonGames: [string];
      lostGames: [string];
      createdAt: string;
    };
    loser: {
      uid: number;
      password: string;
      email: string;
      nickname: string;
      refreshToken: string;
      profileUrl: string;
      twoFactorEnabled: true;
      twoFactorSecret: string;
      followers: {
        fromUserId: number;
        targetToFollowId: number;
        fromUser: string;
        targetToFollow: string;
        createdAt: string;
      }[];
      followings: {
        fromUserId: number;
        targetToFollowId: number;
        fromUser: string;
        targetToFollow: string;
        createdAt: string;
      }[];
      wonGames: [string];
      lostGames: [string];
      createdAt: string;
    };
    winnerScore: number;
    loserScore: number;
    createdAt: string;
  }[];
  date?: Date;
}

export const TFAAtom = atom<boolean>(false);
export const isTFAChange = atom<boolean>(false);
export const ProfileAtom = atom<UserType>({} as UserType);
export const isMyProfileAtom = atom<boolean>(true);

export const UserAtom = atom<UserType>({
  uid: 1,
  nickname: "InitName",
  profileUrl: "/smile.png",
  ELO: 1000,
  followings: [
    {
      uid: 0,
      nickname: "yotak",
      profileUrl: "/smile.png",
      status: "online",
      createdAt: "string",
      followings: ["yotak"],
    },
    {
      uid: 1,
      nickname: "yotak",
      profileUrl: "/smile.png",
      status: "ingame",
      createdAt: "string",
      followings: ["yotak"],
    },
  ],
  games: [
    {
      gid: 0,
      winner: {
        uid: 1,
        password: "string",
        email: "string",
        nickname: "yuhwang",
        refreshToken: "string",
        profileUrl: "../../assets.smile.png",
        twoFactorEnabled: true,
        twoFactorSecret: "string",
        followers: [
          {
            fromUserId: 0,
            targetToFollowId: 0,
            fromUser: "yuhwang",
            targetToFollow: "yotak",
            createdAt: "string",
          },
        ],
        followings: [
          {
            fromUserId: 0,
            targetToFollowId: 0,
            fromUser: "yotak",
            targetToFollow: "yuhwang",
            createdAt: "string",
          },
        ],
        wonGames: ["string"],
        lostGames: ["string"],
        createdAt: "string",
      },
      loser: {
        uid: 0,
        password: "string",
        email: "string",
        nickname: "yotak",
        refreshToken: "string",
        profileUrl: "../../assets.smile.png",
        twoFactorEnabled: true,
        twoFactorSecret: "string",
        followers: [
          {
            fromUserId: 0,
            targetToFollowId: 0,
            fromUser: "string",
            targetToFollow: "string",
            createdAt: "string",
          },
        ],
        followings: [
          {
            fromUserId: 0,
            targetToFollowId: 0,
            fromUser: "string",
            targetToFollow: "string",
            createdAt: "string",
          },
        ],
        wonGames: ["string"],
        lostGames: ["string"],
        createdAt: "string",
      },
      winnerScore: 5,
      loserScore: 4,
      createdAt: "string",
    }],
});

export type { UserType };
