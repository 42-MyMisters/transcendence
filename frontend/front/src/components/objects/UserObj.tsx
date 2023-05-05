import { useAtom } from "jotai";
import { UserInfoModalInfo } from "../atom/UserInfoModalAtom";
import "../../styles/UserObj.css";
import { UserAtom } from '../atom/UserAtom';


export default function UserObj({
  uid,
  nickName,
  profileImage,
  status,
  chat,
  power,
  callBack,
}: {
  uid: number;
  nickName: string;
  profileImage: string;
  status: string;
  chat: string;
  power: string;
  callBack: (uid: number) => void;
}) {
  const [userInfo, setUserInfo] = useAtom(UserInfoModalInfo);
  const [userDefaultInfo, setUserDefaultInfo] = useAtom(UserAtom);
  return (
    <div
      className="UserObj"
      onClick={() => {
        if (uid !== userDefaultInfo.uid) {
          setUserInfo({
            uid: uid,
            nickName: nickName,
            isFollow: false,
            userState: status,
            profileImage: profileImage,
            isIgnored: true,
            myPower: "owner", //[TODO] fix
            userId: 1
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
            ? <div className="UserNickName" style={{ color: "#333" }}>{nickName}</div>
            : <div className="UserNickName" style={{ color: "#888" }}>{nickName}</div>
          : chat === 'normal'
            ? <div className="UserNickName" style={{ color: "#0a0" }}>{nickName}</div>
            : <div className="UserNickName" style={{ color: "#700" }}>{nickName}</div>
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
