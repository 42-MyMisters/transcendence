import { useAtom } from "jotai";
import { changeNameModalAtom } from "../atom/ModalAtom";
import { changeImageModalAtom } from "../atom/ModalAtom";
import { isMyProfileAtom, ProfileAtom } from "../atom/UserAtom";

import "../../styles/ProfilePage.css";
export default function ProfileOptions() {
  const [changeNameModal, setchangeNameModal] = useAtom(changeNameModalAtom);
  const [changeImageModal, setChangeImageModal] = useAtom(changeImageModalAtom);
  const [isMyProfile] = useAtom(isMyProfileAtom);

  return (
    <div>
      {
        isMyProfile
          ? <div className="ProfileOptions">
            <div onClick={() => setchangeNameModal(true)}>change Nickname</div>
            <div onClick={() => setChangeImageModal(true)}>change Profile Image</div>
            <div>
              2FA
              <input type="checkbox" id="checkbox_TFA" name="TFA" value="false" />
              <label htmlFor="checkbox_TFA"></label>
            </div>
          </div>
          : ''
      }
    </div>
  );
}
