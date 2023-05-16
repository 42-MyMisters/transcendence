import "../../styles/LoginModals.css";
import { keyboardKey } from '@testing-library/user-event';
import { useRef, useState, useEffect } from "react";
import * as chatAtom from "../../components/atom/ChatAtom";
import * as api from "../../event/api.request";
import { useAtom } from "jotai";
import { useNavigate } from 'react-router-dom';
import { hasLoginAtom } from "../../components/atom/ChatAtom";
import { isFirstLoginAtom, } from "../../components/atom/LoginAtom";

export default function TFAModal() {
  const [checkError, setCheckError] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [adminConsole] = useAtom(chatAtom.adminConsoleAtom);

  const [isFirstLogin, setIsFirstLogin] = useAtom(isFirstLoginAtom);
  const [hasLogin, setHasLogin] = useAtom(hasLoginAtom);
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
    const format = authCode.toString();
    const confirmRes = await api.loginWithTFA(adminConsole, format);
    if (confirmRes !== 201) {
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
