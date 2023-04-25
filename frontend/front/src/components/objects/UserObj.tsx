import { useAtom } from "jotai";
import { UserInfoModalInfo } from "../atom/UserInfoModalAtom";
import "../../styles/UserObj.css";

export default function UserObj({
  nickName,
  profileImage,
  status,
  power,
  callBack,
}: {
  nickName: string;
  profileImage: string;
  status: string;
  power: string;
  callBack: () => void;
}) {
  let [userInfo, setUserInfo] = useAtom(UserInfoModalInfo);
  return (
    <div
      className="UserObj"
      onClick={() => {
        setUserInfo({
          nickName: nickName,
          isFollow: false,
          userState: status,
          isIgnored: true,
          myPower: "Owner", //[TODO] fix
        });
        callBack();
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
            : status === "ingame"
            ? { backgroundColor: "#54B7BB" }
            : { backgroundColor: "#CA6A71" }
        }
      />
      <div className="UserNickName">{nickName}</div>
      {power === "Owner" ? (
        <div className="UserPowerOwner" />
      ) : power === "Manager" ? (
        <div className="UserPowerManager" />
      ) : null}
    </div>
  );
}
