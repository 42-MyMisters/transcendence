import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { changeImageModalAtom, changeNameModalAtom } from "../atom/ModalAtom";
import { isMyProfileAtom, TFAAtom } from "../atom/UserAtom";

import * as chatAtom from "../atom/ChatAtom";
import * as api from '../../event/api.request';

import { useNavigate } from 'react-router-dom';
import { refreshTokenAtom } from "../atom/LoginAtom";
import { TFAModalAtom, TFAQRURL } from "../atom/ModalAtom";
import { AdminLogPrinter } from '../../event/event.util';
import "../../styles/ProfilePage.css";

export default function ProfileOptions() {
  const setchangeNameModal = useSetAtom(changeNameModalAtom);
  const setChangeImageModal = useSetAtom(changeImageModalAtom);
  const isMyProfile = useAtomValue(isMyProfileAtom);
  const adminConsole = useAtomValue(chatAtom.adminConsoleAtom);
  const [tfa, setTfa] = useAtom(TFAAtom);
  const setRefreshToken = useSetAtom(refreshTokenAtom);
  const navigate = useNavigate();
  const setQRcodeURL = useSetAtom(TFAQRURL);
  const setTFAModal = useSetAtom(TFAModalAtom);

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
        const FTARes = await api.toggleTFA(adminConsole, setQRcodeURL);
        if (FTARes === 401) {
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
