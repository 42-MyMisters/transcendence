import { useAtom } from "jotai";
import { changeNameModalAtom } from "../atom/ModalAtom";
import { changeImageModalAtom } from "../atom/ModalAtom";
import { isMyProfileAtom, TFAAtom, isTFAChange } from "../atom/UserAtom";

import * as chatAtom from "../../components/atom/ChatAtom";
import * as api from '../../event/api.request';

import { useNavigate } from 'react-router-dom';
import "../../styles/ProfilePage.css";
import { useEffect } from 'react';
import { refreshTokenAtom } from "../../components/atom/LoginAtom";
export default function ProfileOptions() {
  const [changeNameModal, setchangeNameModal] = useAtom(changeNameModalAtom);
  const [changeImageModal, setChangeImageModal] = useAtom(changeImageModalAtom);
  const [isMyProfile] = useAtom(isMyProfileAtom);
  const [adminConsole] = useAtom(chatAtom.adminConsoleAtom);
  const [tfa, setTfa] = useAtom(TFAAtom);
  const [isTFAChanged, setIsTFAChanged] = useAtom(isTFAChange);
  const [, setRefreshToken] = useAtom(refreshTokenAtom);
  const navigate = useNavigate();

  const logOutHandler = () => {
    api.LogOut(adminConsole, setRefreshToken, navigate, "/");
  };

  const handleFTARequest = async () => {
    const FTARes = await api.toggleTFA(adminConsole);
    if (FTARes === 401) {
      const refreshResponse = await api.RefreshToken(adminConsole);
      if (refreshResponse !== 201) {
        logOutHandler();
      } else {
        const getMeResponse = await api.toggleTFA(adminConsole);
        if (getMeResponse == 401) {
          logOutHandler();
        }
      }
    }
  };

  useEffect(() => {
    if (isTFAChanged) {
      if (tfa) {
        console.log("2FA on");
        handleFTARequest();
      } else {
        console.log("2FA off");
        handleFTARequest();
      }
      setIsTFAChanged(false);
    }
  }, [tfa]);

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
                  setIsTFAChanged(true);
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
