import "../../styles/ProfilePage.css";

export default function ProfileNick({ nickName }: { nickName: string }) {
  return <div className="ProfileNick">{nickName}</div>;
}
