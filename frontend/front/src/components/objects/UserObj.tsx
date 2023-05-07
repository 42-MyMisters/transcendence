import { useAtom } from "jotai";
import { UserInfoModalInfo } from "../atom/UserInfoModalAtom";
import "../../styles/UserObj.css";
import { UserAtom } from '../atom/UserAtom';
import * as chatAtom from '../atom/ChatAtom';
import { useEffect } from 'react';


export default function UserObj({
  uid,
  nickName,
  profileImage,
  status,
  chat,
  power,
  callBack,
  defaultColor = '#3b3'
}: {
  uid: number;
  nickName: string;
  profileImage: string;
  status: string;
  chat: string;
  power: 'owner' | 'admin' | 'member';
  callBack: (uid: number) => void;
  defaultColor?: string;
}) {
  const [userInfo, setUserInfo] = useAtom(UserInfoModalInfo);
  const [userDefaultInfo, setUserDefaultInfo] = useAtom(UserAtom);
  const [followingList, setFollowingList] = useAtom(chatAtom.followingListAtom);
  const [blockList, setBlockList] = useAtom(chatAtom.blockListAtom);
  const [dmHistoryList] = useAtom(chatAtom.dmHistoryListAtom);


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
            isIgnored: blockList[uid]?.blocked === undefined ? false : true,
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
      <div
        className="UserStatus"
        style={
          status === "online"
            ? { backgroundColor: "#74B667" }
            : status === "inGame"
              ? { backgroundColor: "#54B7BB" }
              : { backgroundColor: "#CA6A71" }
        }
      />
      {
        uid !== userDefaultInfo.uid
          ? chat === 'normal'
            ? blockList[uid] !== undefined
              ? <div className="UserNickName" style={{ color: "#aaa" }}>{nickName}</div>
              : followingList[uid] !== undefined
                ? <div className="UserNickName" style={{ color: `${defaultColor}` }}>{nickName}</div>
                : dmHistoryList[uid] !== undefined
                  ? <div className="UserNickName" style={{ color: "#077" }}>{nickName}</div>
                  : <div className="UserNickName" style={{ color: "#333" }}>{nickName}</div>
            : <div className="UserNickName" style={{ color: "#a55" }}>{nickName}</div>
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
