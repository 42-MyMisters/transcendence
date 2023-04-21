import "../../styles/UserObj.css";

export default function UserObj({
  nickName,
  status,
  power,
  callBack,
}: {
  nickName: string;
  status: string;
  power: string;
  callBack: () => void;
}) {
  return (
    <div className="UserObj">
      <div className="UserProfile" />
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
