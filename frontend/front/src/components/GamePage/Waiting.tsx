import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as chatAtom from "../../components/atom/ChatAtom";
import { refreshTokenAtom } from "../../components/atom/LoginAtom";
import * as api from "../../event/api.request";
import "../../styles/BackGround.css";
import "../../styles/GamePlayerInfo.css";
import { userListAtom } from '../atom/ChatAtom';
import { UserType, GameRecordType } from '../atom/UserAtom';
import CheckBox from "./CheckBox";
import PlayerRecordBoard from "./PlayerRecordBoard";
import { isMatchedAtom, isP1Atom, p1IdAtom, p2IdAtom } from '../atom/GameAtom';

export default function Waiting() {
  const userList = useAtomValue(userListAtom);
  const adminConsole = useAtomValue(chatAtom.adminConsoleAtom);
  const [player1Info, setPlayer1Info] = useState({} as UserType);
  const [player2Info, setPlayer2Info] = useState({} as UserType);
  const setRefreshToken = useSetAtom(refreshTokenAtom);
  const isP1 = useAtomValue(isP1Atom);
  const p1Id = useAtomValue(p1IdAtom);
  const p2Id = useAtomValue(p2IdAtom);
  const isMatched = useAtomValue(isMatchedAtom);

  const navigate = useNavigate();

  const logOutHandler = () => {
    api.LogOut(adminConsole, setRefreshToken, navigate, "/");
  };

  async function getProfileHandler(setter: React.Dispatch<React.SetStateAction<UserType>>, userId: number) {
    const getProfileResponse = await api.GetOtherProfile(adminConsole, setter, userId);
    if (getProfileResponse === 401) {
      const refreshResponse = await api.RefreshToken(adminConsole);
      if (refreshResponse !== 201) {
        logOutHandler();
      } else {
        const getProfileResponse = await api.GetOtherProfile(
          adminConsole,
          setter,
          userId
        );
        if (getProfileResponse === 401) {
          logOutHandler();
        } else {
          navigate("/game");
        }
      }
    } else {
      navigate("/game");
    }
  }

  useEffect(() => {
    if (isMatched) {
      getProfileHandler(setPlayer2Info, p2Id);
    } else {
      getProfileHandler(setPlayer1Info, p1Id);
    }
  }, [isMatched]);

  return (
    <div className="QueueBackGround">
      <div className="LeftWrap">
        <div className="PlayerWrap">
          <div className="PlayerNickName">{player1Info.nickname}</div>
          <PlayerRecordBoard records={player1Info.games} userId={p1Id} />
        </div>
      </div>
      <div className="RightWrap">
        <div className="PlayerWrap">
          {
            isMatched
              ? <div className="PlayerNickName">{player2Info.nickname}</div>
              : <div className="PlayerNickName">{'Waiting...'}</div>
          }
          {
            isMatched
              ? <PlayerRecordBoard records={player2Info.games} userId={p2Id} />
              : <PlayerRecordBoard records={{}} userId={-42} />
          }
        </div>
      </div>
      {
        isP1
          ? <CheckBox />
          : ""
      }
    </div>
  );
}
