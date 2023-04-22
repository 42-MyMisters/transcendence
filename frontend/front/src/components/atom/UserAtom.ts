import { atom, useAtom } from "jotai";

// interface User {
//   uid: number;
//   password: string;
//   email: string;
//   nickname: string;
//   refreshToken: string;
//   profileUrl: string;
//   twoFactorEnabled: boolean;
//   twoFactorSecret: string;
//   followers: [
//     {
//       fromUserId: number;
//       targetToFollowId: number;
//       fromUser: string;
//       targetToFollow: string;
//       createdAt: string;
//     }
//   ];
//   followings: [
//     {
//       fromUserId: number;
//       targetToFollowId: number;
//       fromUser: string;
//       targetToFollow: string;
//       createdAt: string;
//     }
//   ];
//   wonGames: [
//     {
//       gid: number;
//       winner: string;
//       loser: string;
//       winnerScore: number;
//       loserScore: number;
//       createdAt: string;
//     }
//   ];
//   lostGames: [
//     {
//       gid: number;
//       winner: string;
//       loser: string;
//       winnerScore: number;
//       loserScore: number;
//       createdAt: string;
//     }
//   ];
//   createdAt: string;
// }

interface User {
  uid: number;
  nickname: string;
  profileUrl: string;
  ELO: number;
  followings: [
    {
      uid: number;
      nickname: string;
      profileUrl: string;
      status: string;
      createdAt: string;
      followings: [string];
    }
  ];
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
      followers: [
        {
          fromUserId: number;
          targetToFollowId: number;
          fromUser: string;
          targetToFollow: string;
          createdAt: string;
        }
      ];
      followings: [
        {
          fromUserId: number;
          targetToFollowId: number;
          fromUser: string;
          targetToFollow: string;
          createdAt: string;
        }
      ];
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
      followers: [
        {
          fromUserId: number;
          targetToFollowId: number;
          fromUser: string;
          targetToFollow: string;
          createdAt: string;
        }
      ];
      followings: [
        {
          fromUserId: number;
          targetToFollowId: number;
          fromUser: string;
          targetToFollow: string;
          createdAt: string;
        }
      ];
      wonGames: [string];
      lostGames: [string];
      createdAt: string;
    };
    winnerScore: number;
    loserScore: number;
    createdAt: string;
  };
}

export const UserAtom = atom<User | null>(null);
