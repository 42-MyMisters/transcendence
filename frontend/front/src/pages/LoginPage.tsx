import jwt_decode from "jwt-decode";
import { Link } from "react-router-dom";

import { useAtom } from "jotai";
import { useEffect } from "react";
import { useCookies } from "react-cookie";

import BackGround from "../components/BackGround";
import SignInModal from "../components/LoginPage/SignIn";
import TFAModal from "../components/LoginPage/TwoFactorAuth";

import { refreshTokenAtom } from "../components/atom/LoginAtom";
import { cookieAtom } from "../components/atom/LoginAtom";
import { TFAEnabledAtom } from "../components/atom/LoginAtom";
import ChatPage from "./ChatPage";
import { useNavigate } from "react-router-dom";

import * as socket from "../socket/chat.socket";
import * as chatAtom from "../components/atom/ChatAtom";
import { hasLoginAtom } from "../components/atom/ChatAtom";
import InitialSettingModal from "../components/LoginPage/InitialSetting";

import { AdminLogPrinter } from "../event/event.util";

import { UserType } from "../components/atom/UserAtom";
import { useState } from "react";

function CheckNickName(): boolean {
  const [user, setUser] = useState<UserType>();

  fetch(`${process.env.REACT_APP_API_URL}/user/me`, {
    credentials: "include",
    method: "GET",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`${response.status} error occured`);
      }
      response.json();
    })
    .then((data) => {
      if (data === undefined) {
        throw new Error("data is undefined");
      } else setUser(data);
    })
    .catch((error) => {
      console.log(error);
      return false;
    });

  if (user?.nickname.indexOf("#") === -1) return false;
  else return true;
}

export default function LoginPage() {
  /* localstorage에 없는데 cookie에 있으면 로그인이 된거다 */
  /* localstorage에 있으면 로그인 된거다 */
  const [refreshToken, setRefreshToken] = useAtom(refreshTokenAtom);
  const [cookie, setCookie] = useAtom(cookieAtom);
  const [TFAEnabled, setTFAEnabled] = useAtom(TFAEnabledAtom);
  const [hasLogin, setHasLogin] = useAtom(hasLoginAtom);
  const [adminConsole] = useAtom(chatAtom.adminConsoleAtom);

  const cookieIMade = "refreshToken";
  const [cookies, setCookies, removeCookie] = useCookies([cookieIMade]);
  const navigate = useNavigate();
  useEffect(() => {
    /* 로그인 경험이 있는지 확인 */
    const storedRefreshToken = localStorage.getItem("refreshToken");
    if (storedRefreshToken !== null) {
      setRefreshToken(true);
    }
    /* 쿠키가 있음 -> localstorage에 저장해야함 */
    if (cookies[cookieIMade] !== undefined) {
      setCookie(true);
      localStorage.setItem("refreshToken", cookies[cookieIMade]);
      removeCookie(cookieIMade);
      setCookie(false);
    }
  }, [setRefreshToken, setCookie]); // data change

  useEffect(() => {
    /* 2FA가 켜져있는지 확인 */
    const value = localStorage.getItem("refreshToken");
    if (value) {
      const decoded: any = jwt_decode(JSON.stringify(value));
      if (decoded.twoFactorEnabled) {
        setTFAEnabled(true);
      } else {
        if (hasLogin === false) {
          setHasLogin(true);
          navigate("/chat");
        } else {
          AdminLogPrinter(adminConsole, "already login -- ??");
          navigate("/chat");
        }
      }
    }
  }, [setTFAEnabled]);
  return (
    <BackGround>
      {/* refresh Token이 있으면 SigninModal이 꺼짐 */}
      {/* refresh Token이 없으면 SigninModal이 켜짐 */}
      {!refreshToken && <SignInModal />}
      {/* refresh Token이 있고 TFA가 켜져있으면 TFAModal실행 */}
      {refreshToken && TFAEnabled && <TFAModal />}
      {/* refersh Token이 있고 닉네임에 #이 있으면 SettingModal 실행 */}
      {refreshToken && CheckNickName() ? <InitialSettingModal /> : null}
    </BackGround>
  );
}
