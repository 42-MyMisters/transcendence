import "../../styles/ProfilePage.css";

import { PlayerRecordLine } from "../GamePage/PlayerRecordBoard";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import * as chatAtom from "../../components/atom/ChatAtom";
import { refreshTokenAtom } from "../../components/atom/LoginAtom";
import * as api from "../../event/api.request";
import { GameRecordAtom, GameRecordType, isMyProfileAtom, ProfileAtom, UserAtom } from "../atom/UserAtom";

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
                        key={game.gid + game.winnerNickname}
                        LeftSideNickName={game.winnerNickname}
                        LeftSideScore={game.winnerScore}
                        RightSideScore={game.loserScore}
                        RightSideNickName={game.loserNickname}
                      />
                      : <PlayerRecordLine
                        key={game.gid + game.loserNickname}
                        LeftSideNickName={game.loserNickname}
                        LeftSideScore={game.loserScore}
                        RightSideScore={game.winnerScore}
                        RightSideNickName={game.winnerNickname}
                        color={"#E2979C"}
                      />
                    : game.winnerUid === profile.uid
                      ? <PlayerRecordLine
                        key={game.gid + game.winnerNickname}
                        LeftSideNickName={game.winnerNickname}
                        LeftSideScore={game.winnerScore}
                        RightSideScore={game.loserScore}
                        RightSideNickName={game.loserNickname}
                      />
                      : <PlayerRecordLine
                        key={game.gid + game.loserNickname}
                        LeftSideNickName={game.loserNickname}
                        LeftSideScore={game.loserScore}
                        RightSideScore={game.winnerScore}
                        RightSideNickName={game.winnerNickname}
                        color={"#E2979C"}
                      />
                );
              })
          }
        </div>
      </div>
    </div>
  );
}
