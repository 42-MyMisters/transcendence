import { useAtomValue, useSetAtom } from "jotai";
import "../../styles/UserObj.css";
import * as chatAtom from '../atom/ChatAtom';
import { UserAtom } from '../atom/UserAtom';
import { UserInfoModalInfo } from "../atom/UserInfoModalAtom";


export default function UserObj({
  uid,
  nickName,
  profileImage,
  status,
  chat,
  power,
  callBack,
  defaultColor = '#3b3',
  dm,
  focusList,
}: {
  uid: number;
  nickName: string;
  profileImage: string;
  status: string;
  chat: string;
  power: 'owner' | 'admin' | 'member';
  callBack: (uid: number) => void;
  defaultColor?: string;
  dm?: boolean;
  focusList?: "userList" | "roomUserList" | "followingList"
}) {
  const setUserInfo = useSetAtom(UserInfoModalInfo);
  const userDefaultInfo = useAtomValue(UserAtom);
  const followingList = useAtomValue(chatAtom.followingListAtom);
  const blockList = useAtomValue(chatAtom.blockListAtom);

  return (
    <div
      className="UserObj"
      onClick={() => {
        if (uid !== userDefaultInfo.uid) {
          setUserInfo({
            uid: uid,
            nickName: nickName,
            isFollow: followingList[uid] === undefined ? false : true,
            userState: status,
            profileImage: profileImage,
            isIgnored: blockList[uid] === undefined ? false : true,
            userPower: power,
          });
          callBack(uid);
        }
      }}
    >
      <div
        className="UserProfile"
        style={{
          backgroundImage: `url(${profileImage})`,
          backgroundSize: "50px",
          width: "50px",
          height: "50px",
        }}
      />
      {
        status === ''
          ? ''
          : <div
            className="UserStatus"
            style={
              status === "online"
                ? { backgroundColor: "#74B667" }
                : status === "inGame"
                  ? { backgroundColor: "#54B7BB" }
                  : status === 'offline'
                    ? { backgroundColor: "#CA6A71" }
                    : { backgroundColor: "#d9d9d9" }
            }
          />
      }
      {
        uid !== userDefaultInfo.uid
          ? focusList !== 'userList'
            ? chat === 'normal'
              ? blockList[uid] !== undefined
                ? <div className="UserNickName" style={{ color: "#aaa" }}>{nickName}</div>
                : followingList[uid] !== undefined
                  ? <div className="UserNickName" style={{ color: `${defaultColor}` }}>{nickName}</div>
                  : <div className="UserNickName" style={{ color: "#333" }}>{nickName}</div>
              : <div className="UserNickName" style={{ color: "#a55" }}>{nickName}</div>
            : blockList[uid] !== undefined
              ? <div className="UserNickName" style={{ color: "#aaa" }}>{nickName}</div>
              : dm === true
                ? <div className="UserNickName" style={{ color: "#73f" }}>{nickName}</div>
                : followingList[uid] !== undefined
                  ? <div className="UserNickName" style={{ color: `${defaultColor}` }}>{nickName}</div>
                  : <div className="UserNickName" style={{ color: "#333" }}>{nickName}</div>
          : chat === 'normal'
            ? <div className="UserNickName" style={{ color: "#0af" }}>{nickName}</div>
            : <div className="UserNickName" style={{ color: "#f00" }}>{nickName}</div>
      }
      {
        power === "owner" ? (
          <div className="UserPowerOwner" />
        ) : power === "admin" ? (
          <div className="UserPowerAdmin" />
        ) : null
      }
    </div >
  );
}
