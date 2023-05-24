import "../../styles/ProfilePage.css";

import { PlayerRecordLine } from "../GamePage/PlayerRecordBoard";

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
  const [totalGameCount, setTotalGameCount] = useState(0);
  const [winGameCount, setWinGameCount] = useState(0);
  const [loseGameCount, setLoseGameCount] = useState(0);

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
        } else {
          gameRecordCounterHandler(userInfo.uid);
        }
      }
    } else {
      gameRecordCounterHandler(userInfo.uid);
    }
  }

  const gameRecordCounterHandler = (uid: number) => {
    let _totalGameCount = 0;
    let _winGameCount = 0;
    let _loseGameCount = 0;
    console.log(gameRecord);
    gameRecord.forEach((game) => {
      _totalGameCount++;
      console.log(game.winnerUid, game.loserUid, uid);
      if (game.winnerUid === uid) {
        _winGameCount++;
      } else {
        _loseGameCount++;
      }
    });
    setTotalGameCount(_totalGameCount);
    setWinGameCount(_winGameCount);
    setLoseGameCount(_loseGameCount);
  };

  useEffect(() => {
    if (isMyProfile) {
      getGameRecordHandler(setGameRecord, userInfo.uid);
    } else {
      gameRecordCounterHandler(profile.uid);
    }
  }, []);

  return (
    <div className="ProfileMatchFrame">
      {
        // <div className="ProfileMatchScore">{`${gameRecord?.length ?? 0}games ${gameRecord?.filter((game) => game.winnerNickname === userInfo.nickname)?.length ?? 0
        //   }win ${gameRecord?.filter((game) => game.winnerNickname !== userInfo.nickname)?.length ?? 0
        //   }lose`}</div>
        <div className="ProfileMatchScore">{`${totalGameCount}games ${winGameCount}win ${loseGameCount}lose`}</div>
      }
      {
        isMyProfile
          ? <div className="ProfileMatchELO">{`ELO ${userInfo?.ELO ?? 1000}`}</div>
          : <div className="ProfileMatchELO">{`ELO ${profile?.ELO ?? 1000}`}</div>
      }
      <div className="ProfileMatchHistoryBG">
        <div className="ProfileMatchHistoryList">
          {
            gameRecord.length === 0
              ? ''
              : ''
            // : gameRecord?.map((game) => {
            //   return (
            //     <PlayerRecordLine
            //       key={game.gid + game.winnerNickname + game.loserNickname}
            //       LeftSideNickName={game.winnerNickname}
            //       LeftSideScore={game.winnerScore}
            //       RightSideScore={game.loserScore}
            //       RightSideNickName={game.loserNickname}
            //     />
            //   );
            // })
          }
        </div>
      </div>
    </div>
  );
}
