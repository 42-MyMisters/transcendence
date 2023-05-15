import jwt_decode from "jwt-decode";
import { Link } from "react-router-dom";

import { useAtom } from "jotai";
import { useEffect } from "react";
import { useCookies } from "react-cookie";

import BackGround from "../components/BackGround";
import SignInModal from "../components/LoginPage/SignIn";
import TFAModal from "../components/LoginPage/TwoFactorAuth";

import { isFirstLoginAtom, refreshTokenAtom } from "../components/atom/LoginAtom";
import { cookieAtom } from "../components/atom/LoginAtom";
import { TFAEnabledAtom } from "../components/atom/LoginAtom";
import ChatPage from "./ChatPage";
import { useNavigate } from "react-router-dom";

import * as socket from "../socket/chat.socket";
import * as chatAtom from "../components/atom/ChatAtom";
import { hasLoginAtom } from "../components/atom/ChatAtom";
import InitialSettingModal from "../components/LoginPage/InitialSetting";

import { AdminLogPrinter } from "../event/event.util";

export default function LoginPage() {
  /* localstorage에 없는데 cookie에 있으면 로그인이 된거다 */
  /* localstorage에 있으면 로그인 된거다 */
  const [refreshToken, setRefreshToken] = useAtom(refreshTokenAtom);
  const [cookie, setCookie] = useAtom(cookieAtom);
  const [TFAEnabled, setTFAEnabled] = useAtom(TFAEnabledAtom);
  const [hasLogin, setHasLogin] = useAtom(hasLoginAtom);
  const [isFirstLogin, setIsFirstLogin] = useAtom(isFirstLoginAtom);

  const [adminConsole] = useAtom(chatAtom.adminConsoleAtom);

  const refreshTokenKey = "refreshToken";
  const [cookies, setCookies, removeCookie] = useCookies([refreshTokenKey]);
  const navigate = useNavigate();

  useEffect(() => {
    if (cookies[refreshTokenKey] !== undefined) {
      setCookie(true);
      localStorage.setItem("refreshToken", cookies[refreshTokenKey]);
      removeCookie(refreshTokenKey);
      setCookie(false);
    }

    const storedRefreshToken = localStorage.getItem("refreshToken");
    if (storedRefreshToken !== null) {
      setRefreshToken(true);

      const decoded: any = jwt_decode(JSON.stringify(storedRefreshToken));
      if (decoded.twoFactorEnabled) {
        setTFAEnabled(true);
      } else {
        fetch(`${process.env.REACT_APP_API_URL}/user/me`, {
          credentials: "include",
          method: "GET",
        })
          .then((response) => {
            switch (response.status) {
              case 200: {
                return response.json();
              }
              default: {
                throw new Error(`${response.status}`);
              }
            }
          })
          .then((response) => {
            if (response.nickname.includes("#")) {
              setIsFirstLogin(true);
            } else {
              setIsFirstLogin(false);
            }
          });

        if (hasLogin === false) {
          setHasLogin(true);
          navigate("/chat");
        } else {
          AdminLogPrinter(adminConsole, "already login -- ??");
          navigate("/chat");
        }
      }
    } else {
      setRefreshToken(false);
    }
  }, [setRefreshToken, setCookie]); // data change

  return (
    <BackGround>
      {/* refresh Token이 있으면 SigninModal이 꺼짐 */}
      {/* refresh Token이 없으면 SigninModal이 켜짐 */}
      {!refreshToken && <SignInModal />}
      {/* refresh Token이 있고 cookie가 없으면 TFAModal실행 */}
      {refreshToken && !cookie && TFAEnabled && <TFAModal />}
      {refreshToken && !hasLogin ? <InitialSettingModal /> : null}
    </BackGround>
  );
}
