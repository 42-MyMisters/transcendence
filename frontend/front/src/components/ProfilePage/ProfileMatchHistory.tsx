import "../../styles/ProfilePage.css";

import { PlayerRecordLine, PlayerRecordLineLose } from "../GamePage/PlayerRecordBoard";

import { ReactElement, useEffect, useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { ProfileAtom, UserAtom, isMyProfileAtom, GameRecordAtom, GameRecordType } from "../atom/UserAtom";
import { Game } from "../GamePage/Pong";
import * as api from "../../event/api.request";
import * as chatAtom from "../../components/atom/ChatAtom";
import { refreshTokenAtom } from "../../components/atom/LoginAtom";
import { useNavigate } from 'react-router-dom';

export default function ProfileMatchHistory() {
  const isMyProfile = useAtomValue(isMyProfileAtom);
  const userInfo = useAtomValue(UserAtom);
  const profile = useAtomValue(ProfileAtom);
  const [gameRecord, setGameRecord] = useAtom(GameRecordAtom);
  const adminConsole = useAtomValue(chatAtom.adminConsoleAtom);
  const setRefreshToken = useSetAtom(refreshTokenAtom);
  const navigate = useNavigate();

  const logOutHandler = () => {
    api.LogOut(adminConsole, setRefreshToken, navigate, "/");
  };

  async function getGameRecordHandler(setter: React.Dispatch<React.SetStateAction<GameRecordType[]>>, userId: number) {
    const getProfileResponse = await api.GetOtherGameRecord(adminConsole, setter, userId);
    if (getProfileResponse === 401) {
      const refreshResponse = await api.RefreshToken(adminConsole);
      if (refreshResponse !== 201) {
        logOutHandler();
      } else {
        const getProfileResponse = await api.GetOtherGameRecord(
          adminConsole,
          setter,
          userId
        );
        if (getProfileResponse === 401) {
          logOutHandler();
        }
      }
    }
  }

  useEffect(() => {
    if (isMyProfile) {
      getGameRecordHandler(setGameRecord, userInfo.uid);
    }
  }, []);

  return (
    <div className="ProfileMatchFrame">
      {
        isMyProfile
          ? <div className="ProfileMatchScore">{`${gameRecord?.length ?? 0}games ${gameRecord?.filter((game) => game.winnerNickname === userInfo.nickname)?.length ?? 0
            }win ${gameRecord?.filter((game) => game.winnerNickname !== userInfo.nickname)?.length ?? 0
            }lose`}</div>
          : <div className="ProfileMatchScore">{`${gameRecord?.length ?? 0}games ${gameRecord?.filter((game) => game.winnerNickname === profile.nickname)?.length ?? 0
            }win ${gameRecord?.filter((game) => game.winnerNickname !== profile.nickname)?.length ?? 0
            }lose`}</div>
      }
      {
        isMyProfile
          ? <div className="ProfileMatchELO">{`ELO ${userInfo?.ELO ?? 1000}`}</div>
          : <div className="ProfileMatchELO">{`ELO ${profile?.ELO ?? 1000}`}</div>
      }
      <div className="ProfileMatchHistoryBG">
        <div className="ProfileMatchHistoryList">
          {
            gameRecord?.length === 0
              ? ''
              // : ''
              : gameRecord?.map((game) => {
                return (
                  isMyProfile
                    ? game.winnerUid === userInfo.uid
                      ? <PlayerRecordLine
                        key={game.gid + game.winnerNickname + game.loserNickname}
                        LeftSideNickName={game.winnerNickname}
                        LeftSideScore={game.winnerScore}
                        RightSideScore={game.loserScore}
                        RightSideNickName={game.loserNickname}
                      />
                      : <PlayerRecordLineLose
                        key={game.gid + game.winnerNickname + game.loserNickname}
                        LeftSideNickName={game.winnerNickname}
                        LeftSideScore={game.winnerScore}
                        RightSideScore={game.loserScore}
                        RightSideNickName={game.loserNickname}
                      />
                    : game.winnerUid === profile.uid
                      ? <PlayerRecordLine
                        key={game.gid + game.winnerNickname + game.loserNickname}
                        LeftSideNickName={game.winnerNickname}
                        LeftSideScore={game.winnerScore}
                        RightSideScore={game.loserScore}
                        RightSideNickName={game.loserNickname}
                      />
                      : <PlayerRecordLineLose
                        key={game.gid + game.winnerNickname + game.loserNickname}
                        LeftSideNickName={game.winnerNickname}
                        LeftSideScore={game.winnerScore}
                        RightSideScore={game.loserScore}
                        RightSideNickName={game.loserNickname}
                      />
                );
              })
          }
        </div>
      </div>
    </div>
  );
}
