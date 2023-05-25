import { Link, NavLink, useNavigate } from "react-router-dom";
import "../styles/TopBar.css";

import { useAtomValue, useSetAtom } from "jotai";
import * as chatAtom from "../components/atom/ChatAtom";
import { isMyProfileAtom } from "../components/atom/UserAtom";
import { LogOut } from "../event/api.request";
import { AdminLogPrinter } from "../event/event.util";
import { isGameStartedAtom, isPrivateAtom } from "./atom/GameAtom";
import { refreshTokenAtom } from "./atom/LoginAtom";

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
  const setIsGameStart = useSetAtom(isGameStartedAtom);

  const clickHandler = () => {
    setIsGameStart(false);
  };

  return (
    <div className="TopBarBtn" onClick={clickHandler}>
      <NavLink to="/chat" className="AStyle" style={getNavLinkStyle}>
        Chat
      </NavLink>
    </div>
  );
}

function QueueBtn() {
  const setIsPrivate = useSetAtom(isPrivateAtom);
  const setIsGameStart = useSetAtom(isGameStartedAtom);

  const clickHandler = () => {
    setIsPrivate(false);
    setIsGameStart(false);
  };

  return (
    <div className="TopBarBtn" onClick={clickHandler}>
      <NavLink to="/game" className="AStyle" style={getNavLinkStyle}>
        Queue
      </NavLink>
    </div>
  );
}

function ProfileBtn() {
  const setIsMyProfile = useSetAtom(isMyProfileAtom);
  const setIsGameStart = useSetAtom(isGameStartedAtom);

  const clickHandler = () => {
    setIsMyProfile(true);
    setIsGameStart(false);
  };

  return (
    <div className="TopBarBtn" onClick={clickHandler}>
      <NavLink to="/profile" className="AStyle" style={getNavLinkStyle}>
        Profile
      </NavLink>
    </div>
  );
}

function LogoutBtn() {
  const setRefreshToken = useSetAtom(refreshTokenAtom);
  const setIsFirstLogin = useSetAtom(chatAtom.isFirstLoginAtom);
  const setHasLogin = useSetAtom(chatAtom.hasLoginAtom);
  const adminConsole = useAtomValue(chatAtom.adminConsoleAtom);

  const navigate = useNavigate();

  const handleLogOut = () => {
    fetch(`${process.env.REACT_APP_API_URL}/login/signout`, {
      credentials: "include",
      method: "POST",
    })
      .then((res) => {
        if (res.status !== 201) {
          throw new Error("Logout Error");
        }
      })
      .catch((err) => {
        AdminLogPrinter(adminConsole, err);
      });
    LogOut(adminConsole, setRefreshToken, navigate, "/");
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
