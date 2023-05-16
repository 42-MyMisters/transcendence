import { useState } from "react";
import "../styles/TFAQRModal.css";
import { useAtom } from "jotai";
import { TFAModalAtom, TFAQRURL, TFAConfirmAtom } from "./atom/ModalAtom";
import { useAutoFocus } from '../event/event.util';
import { keyboardKey } from '@testing-library/user-event';
import { TFAAtom } from "./atom/UserAtom";
import { PressKey, AdminLogPrinter } from "../event/event.util";
import * as api from '../event/api.request';
import * as chatAtom from "../components/atom/ChatAtom";
import { refreshTokenAtom } from "../components/atom/LoginAtom";
import { useNavigate } from 'react-router-dom';

export default function TFAQRModal({ AuthBtn }: { AuthBtn: () => void }) {
  const [authCode, setAuthCode] = useState("");
  const [qrcodeURL, setQRcodeURL] = useAtom(TFAQRURL);
  const [TFAModal, setTFAModal] = useAtom(TFAModalAtom);
  const [tfa, setTfa] = useAtom(TFAAtom);
  const [TFAConfirm, setTFAConfirm] = useAtom(TFAConfirmAtom);
  const [adminConsole] = useAtom(chatAtom.adminConsoleAtom);
  const [, setRefreshToken] = useAtom(refreshTokenAtom);

  const navigate = useNavigate();
  const inputRef = useAutoFocus();

  PressKey(["Escape"], () => {
    setTFAModal(false);
    setQRcodeURL("");
    if (!TFAConfirm) {
      setTfa(false);
    }
  });

  // const logOutHandler = () => {
  //   api.LogOut(adminConsole, setRefreshToken, navigate, "/");
  // };

  const handleAuthenticate = async () => {
    if (!Number(authCode) || !Number.isInteger(Number(authCode)) || Number(authCode) < 0) {
      alert("Please enter digit only");
      setAuthCode("");
      return;
    } else if (authCode.length !== 6) {
      alert("Please enter 6 digits");
      setAuthCode("");
      return;
    }

    const format = JSON.stringify({ twoFactorCode: authCode });
    AdminLogPrinter(adminConsole, "TFA Code: ", format);
    const confirmRes = await api.confirmTFA(adminConsole, format);
    if (confirmRes !== 200) {
      alert("please enter right code");
      setAuthCode("");
    } else {
      setTFAConfirm(true);
      setTFAModal(false);
      setQRcodeURL("");
      setAuthCode("");
    }
  };

  const handleEnterEvent = (e: keyboardKey) => {
    if (e.key === 'Enter') {
      handleAuthenticate();
    }
  }

  return (
    <>
      <div className="TFAQRModalBG" />
      <div className="TFAQRModal">
        <div
          className="TFAQRCode"
          style={{
            backgroundImage: `url(${qrcodeURL})`,
            backgroundSize: "200px",
            width: "200px",
            height: "200px",
          }}
        />
        <div className="TFAAuthCodeForm">
          <label htmlFor="TFAAuthCode">Numbers</label>
          <input
            id="TFAAuthCode"
            ref={inputRef}
            type="digit"
            placeholder="Six Number"
            minLength={6}
            maxLength={6}
            value={authCode}
            onChange={(e) => {
              setAuthCode(e.target.value);
            }}
            onKeyDown={(e) => handleEnterEvent(e)}
          />
        </div>
        <button className="TFAAuthBtn" onClick={handleAuthenticate} >
          Authenticate
        </button>
      </div>
    </>
  );
}
