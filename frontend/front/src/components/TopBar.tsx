import "../css/TopBar.css";

export default function TopBar() {
  return (
    <div className="TopBarBG">
      <LogoBtn />
      <div className="TopBarBtnAlign">
        <ChatBtn />
        <QueueBtn />
        <ProfileBtn />
        <LogoutBtn />
      </div>
    </div>
  );
}

function LogoBtn() {
  return <div className="TopBarBtn TopBarLogo">MyMisters</div>;
}

function ChatBtn() {
  return <div className="TopBarBtn">Chat</div>;
}

function QueueBtn() {
  return <div className="TopBarBtn">Queue</div>;
}

function ProfileBtn() {
  return <div className="TopBarBtn">Profile</div>;
}

function LogoutBtn() {
  return <div className="TopBarBtn">Logout</div>;
}
