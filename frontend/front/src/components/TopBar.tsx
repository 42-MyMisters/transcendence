import { Cookies } from "react-cookie";
import "../styles/TopBar.css";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAtom } from "jotai";
import { refreshTokenAtom } from "./atom/LoginAtom";
import { LogOut } from '../event/api.request';
import * as socket from "../socket/chat.socket";
import * as chatAtom from "../components/atom/ChatAtom";

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

function getNavLinkStyle({ isActive }: { isActive: boolean }) {
  return {
    textDecoration: isActive ? "underline" : undefined,
  };
}

function LogoBtn() {
  return (
    <div className="TopBarBtn TopBarLogo">
      <a className="AStyle" href="https://github.com/42-MyMisters" target="_blank" rel="noreferrer">
        MyMisters
      </a>
    </div>
  );
}

function ChatBtn() {
  return (
    <div className="TopBarBtn">
      <NavLink to="/chat" className="AStyle" style={getNavLinkStyle}>
        Chat
      </NavLink>
    </div>
  );
}

function QueueBtn() {
  return (
    <div className="TopBarBtn">
      <NavLink to="/game" className="AStyle" style={getNavLinkStyle}>
        Queue
      </NavLink>
    </div>
  );
}

function ProfileBtn() {
  return (
    <div className="TopBarBtn">
      <NavLink to="/profile" className="AStyle" style={getNavLinkStyle}>
        Profile
      </NavLink>
    </div>
  );
}

function LogoutBtn() {
  const [, setRefreshToken] = useAtom(refreshTokenAtom);
  const [isFirstLogin, setIsFirstLogin] = useAtom(chatAtom.isFirstLoginAtom);
  const [hasLogin, setHasLogin] = useAtom(chatAtom.hasLoginAtom);

  const navigate = useNavigate();

  const handleLogOut = () => {
    fetch("http://localhost:4000/login/signout", {
      credentials: "include",
      method: "POST",
    }).then((res) => {
      if (res.status !== 201) {
        throw new Error("Logout Error");
      }
    }).catch((err) => {
      console.log(err);
    });
    LogOut(setRefreshToken, navigate, "/");
    setHasLogin(false);
    setIsFirstLogin(true);
  };

  return (
    <div className="TopBarBtn" onClick={handleLogOut}>
      <Link className="AStyle" to="/">
        Logout
      </Link>
    </div>
  );
}
