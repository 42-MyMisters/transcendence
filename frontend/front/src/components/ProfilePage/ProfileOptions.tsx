import { useAtom } from "jotai";
import { changeNameModalAtom } from "../atom/ModalAtom";
import { changeImageModalAtom } from "../atom/ModalAtom";
import { isMyProfileAtom, TFAAtom, isTFAChange } from "../atom/UserAtom";

import "../../styles/ProfilePage.css";
import { useEffect } from 'react';
export default function ProfileOptions() {
  const [changeNameModal, setchangeNameModal] = useAtom(changeNameModalAtom);
  const [changeImageModal, setChangeImageModal] = useAtom(changeImageModalAtom);
  const [isMyProfile] = useAtom(isMyProfileAtom);
  const [tfa, setTfa] = useAtom(TFAAtom);
  const [isTFAChanged, setIsTFAChanged] = useAtom(isTFAChange);

  useEffect(() => {
    if (isTFAChanged) {
      if (tfa) {
        console.log("2FA on");
      } else {
        console.log("2FA off");
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
