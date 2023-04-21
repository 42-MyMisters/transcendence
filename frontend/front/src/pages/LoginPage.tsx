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

import * as socket from "../socket/socket";
import { hasLogin } from '../components/atom/SocketAtom';

export default function LoginPage() {
  /* localstorage에 없는데 cookie에 있으면 로그인이 된거다 */
  /* localstorage에 있으면 로그인 된거다 */
  const [refreshToken, setRefreshToken] = useAtom(refreshTokenAtom);
  const [cookie, setCookie] = useAtom(cookieAtom);
  const [TFAEnabled, setTFAEnabled] = useAtom(TFAEnabledAtom);
  const [hasLoginIndicator, setHasLoginIndicator] = useAtom(hasLogin);

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
        console.log("move to chat page");
        setHasLoginIndicator(true);
        socket.socket.connect();
        socket.OnSocketEvent();
        navigate("/chat");
      }
    }
  }, [setTFAEnabled]);
  return (
    <BackGround>
      {/* refresh Token이 있으면 SigninModal이 꺼짐 */}
      {/* refresh Token이 없으면 SigninModal이 켜짐 */}
      {!refreshToken && <SignInModal />}
      {/* refresh Token이 있고 cookie가 없으면 TFAModal실행 */}
      {refreshToken && !cookie && TFAEnabled && <TFAModal />}
    </BackGround>
  );
}
