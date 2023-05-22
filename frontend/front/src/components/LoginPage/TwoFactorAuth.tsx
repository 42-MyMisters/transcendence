import { keyboardKey } from '@testing-library/user-event';
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import * as chatAtom from "../../components/atom/ChatAtom";
import { hasLoginAtom } from "../../components/atom/ChatAtom";
import { isFirstLoginAtom, } from "../../components/atom/LoginAtom";
import * as api from "../../event/api.request";
import { AdminLogPrinter } from '../../event/event.util';
import "../../styles/LoginModals.css";

export default function TFAModal() {
  const [checkError, setCheckError] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const adminConsole = useAtomValue(chatAtom.adminConsoleAtom);
  const setIsFirstLogin = useSetAtom(isFirstLoginAtom);
  const setHasLogin = useSetAtom(hasLoginAtom);
  const navigate = useNavigate();

  const useAutoFocus = () => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, [checkError]);

    return inputRef;
  };

  const AuthCodeRef = useAutoFocus();

  const handleAuthenticate = async (): Promise<boolean> => {
    if (!Number(authCode) || !Number.isInteger(Number(authCode)) || Number(authCode) < 0) {
      alert("Please enter digit only");
      return false;
    } else if (authCode.length !== 6) {
      alert("Please enter 6 digits");
      return false;
    }

    const format = JSON.stringify({ twoFactorCode: authCode });
    AdminLogPrinter(adminConsole, "TFA Code: ", format);
    const loginTFARes = await api.loginWithTFA(adminConsole, format);
    if (loginTFARes !== 302) {
      alert("please enter right code");
      return false;
    } else {
      return true;
    }
  };

  const checkValification = async () => {
    const isValified = await handleAuthenticate();
    if (!isValified) {
      setAuthCode("");
      setCheckError((prev) => (!prev));
      return;
    }
    setIsFirstLogin(false);
    setHasLogin(true);
    navigate("/chat");
  };


  const handleEnterEvent = (e: keyboardKey) => {
    if (e.key === 'Enter') {
      checkValification();
    }
  }

  return (
    <div className="LoginModalsBG">
      <div className="LoginTxt">2FA</div>
      <input
        type="text"
        ref={AuthCodeRef}
        className="LoginModalInput"
        placeholder="Six Number"
        minLength={6}
        maxLength={6}
        value={authCode}
        onChange={(e) => {
          setAuthCode(e.target.value);
        }}
        onKeyDown={(e) => handleEnterEvent(e)}
      />
      <button className="LoginBtn" onClick={checkValification}>verify</button>
    </div>
  );
}
