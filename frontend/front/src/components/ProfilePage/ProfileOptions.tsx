import { useAtom } from "jotai";
import { changeNameModalAtom } from "../atom/ModalAtom";
import { changeImageModalAtom } from "../atom/ModalAtom";
import { isMyProfileAtom, TFAAtom } from "../atom/UserAtom";

import * as chatAtom from "../../components/atom/ChatAtom";
import * as api from '../../event/api.request';

import { useNavigate } from 'react-router-dom';
import "../../styles/ProfilePage.css";
import { useEffect } from 'react';
import { refreshTokenAtom } from "../../components/atom/LoginAtom";
import { AdminLogPrinter } from '../../event/event.util';
import { TFAModalAtom, TFAQRURL } from "../../components/atom/ModalAtom";

export default function ProfileOptions() {
  const [changeNameModal, setchangeNameModal] = useAtom(changeNameModalAtom);
  const [changeImageModal, setChangeImageModal] = useAtom(changeImageModalAtom);
  const [isMyProfile] = useAtom(isMyProfileAtom);
  const [adminConsole] = useAtom(chatAtom.adminConsoleAtom);
  const [tfa, setTfa] = useAtom(TFAAtom);
  const [, setRefreshToken] = useAtom(refreshTokenAtom);
  const navigate = useNavigate();
  const [qrcodeURL, setQRcodeURL] = useAtom(TFAQRURL);
  const [TFAModal, setTFAModal] = useAtom(TFAModalAtom);

  const logOutHandler = () => {
    api.LogOut(adminConsole, setRefreshToken, navigate, "/");
  };

  const handleFTARequest = async () => {
    const FTARes = await api.toggleTFA(adminConsole, setQRcodeURL);
    if (FTARes === 401) {
      const refreshResponse = await api.RefreshToken(adminConsole);
      if (refreshResponse !== 201) {
        logOutHandler();
      } else {
        const getMeResponse = await api.toggleTFA(adminConsole, setQRcodeURL);
        if (getMeResponse == 401) {
          logOutHandler();
        }
      }
    }
  };

  const handleTFA = async () => {
    if (tfa) {
      AdminLogPrinter(adminConsole, "\n2FA off");
      await handleFTARequest();
    } else {
      AdminLogPrinter(adminConsole, "\n2FA on");
      await handleFTARequest();
      setTFAModal(true);
    }
  };

  return (
    <div>
      {
        isMyProfile
          ? <div className="ProfileOptions">
            <div onClick={() => setchangeNameModal(true)}>change Nickname</div>
            <div onClick={() => setChangeImageModal(true)}>change Profile Image</div>
            <div>
              2FA
              <input type="checkbox" id="checkbox_TFA" name="TFA" value="false"
                onChange={(e) => {
                  setTfa(e.target.checked);
                  handleTFA();
                }
                }
                checked={tfa}
              />
              <label htmlFor="checkbox_TFA"></label>
            </div>
          </div>
          : ''
      }
    </div>
  );
}
