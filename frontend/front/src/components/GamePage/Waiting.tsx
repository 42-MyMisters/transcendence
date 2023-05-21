import "../../styles/BackGround.css";
import "../../styles/GamePlayerInfo.css";
import PlayerRecordBoard from "./PlayerRecordBoard";
import CheckBox from "./CheckBox";
import { useAtom, useAtomValue } from 'jotai';
import { userListAtom } from '../atom/ChatAtom';
import * as api from "../../event/api.request";
import * as chatAtom from "../../components/atom/ChatAtom";
import * as gameAtom from "../../components/atom/GameAtom";
import { UserAtom } from '../atom/UserAtom';

export default function Waiting({ p1, p2 }: { p1: number, p2: number }) {
  const userList = useAtomValue(userListAtom);
  const adminConsole = useAtomValue(chatAtom.adminConsoleAtom);
  const userInfo = useAtomValue(UserAtom);

  // const player1 = useAtomValue(gameAtom.player1Atom);
  // const [player1Info,  = useState({} as UserType);

  // async function getProfileHandler() {
  //   const getProfileResponse = await api.GetOtherProfile(adminConsole, setProfile, player1);
  //   if (getProfileResponse === 401) {
  //     const refreshResponse = await api.RefreshToken(adminConsole);
  //     if (refreshResponse !== 201) {
  //       logOutHandler();
  //     } else {
  //       const getProfileResponse = await api.GetOtherProfile(
  //         adminConsole,
  //         setProfile,
  //         userInfo.uid
  //       );
  //       if (getProfileResponse === 401) {
  //         logOutHandler();
  //       } else {
  //         navigate("/profile");
  //       }
  //     }
  //   } else {
  //     navigate("/profile");
  //   }
  // }

  return (
    <div className="QueueBackGround">
      <div className="LeftWrap">
        <div className="PlayerWrap">
          <div className="PlayerNickName">{userInfo.nickname}</div>
          {/* <PlayerRecordBoard records={userInfo.games} userId={userInfo.uid} /> */}
        </div>
      </div>
      <div className="RightWrap">
        <div className="PlayerWrap">
          <div className="PlayerNickName">{p2 !== -42 ? userList[p2].userDisplayName : 'Waiting...'}</div>
          {/* <PlayerRecordBoard records={userInfo.games} userId={1} /> */}
        </div>
      </div>
      <CheckBox />
    </div>
  );
}
