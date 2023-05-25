import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as chatAtom from "../../components/atom/ChatAtom";
import { refreshTokenAtom } from "../../components/atom/LoginAtom";
import * as api from "../../event/api.request";
import { AdminLogPrinter } from '../../event/event.util';
import "../../styles/BackGround.css";
import "../../styles/GamePlayerInfo.css";
import { userListAtom } from '../atom/ChatAtom';
import { GamePlayer, gamePlayerAtom, isMatchedAtom, isPrivateAtom, p1IdAtom, p2IdAtom } from '../atom/GameAtom';
import { GameRecordType } from '../atom/UserAtom';
import CheckBox from "./CheckBox";
import PlayerRecordBoard from "./PlayerRecordBoard";

export default function Waiting() {
  const [player1Info, setPlayer1Info] = useState([] as GameRecordType[]);
  const [player2Info, setPlayer2Info] = useState([] as GameRecordType[]);

  const setRefreshToken = useSetAtom(refreshTokenAtom);
  
  const gamePlayer = useAtomValue(gamePlayerAtom);
  const p1Id = useAtomValue(p1IdAtom);
  const p2Id = useAtomValue(p2IdAtom);

  const userList = useAtomValue(userListAtom);
  const adminConsole = useAtomValue(chatAtom.adminConsoleAtom);

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
    getGameRecordHandler(setPlayer1Info, p1Id)
      .catch((e) => { AdminLogPrinter(adminConsole, e) });
    getGameRecordHandler(setPlayer2Info, p2Id)
      .catch((e) => { AdminLogPrinter(adminConsole, e) });
  }, [p1Id, p2Id]);

  return (
    <div className="QueueBackGround">
      <div className="LeftWrap">
        <div className="PlayerWrap">
          <div className="PlayerNickName">{userList[p1Id]?.userDisplayName ?? 'LeftName'}</div>
          <PlayerRecordBoard records={player1Info} userId={p1Id} />
        </div>
      </div>
      <div className="RightWrap">
        <div className="PlayerWrap">
          <div className="PlayerNickName">{userList[p2Id]?.userDisplayName ?? 'RightName'}</div>
          <PlayerRecordBoard records={player2Info} userId={p2Id} />
        </div>
      </div>
      {
        gamePlayer === GamePlayer.player1
          ? <CheckBox />
          : ""
      }
    </div>
  );
}
