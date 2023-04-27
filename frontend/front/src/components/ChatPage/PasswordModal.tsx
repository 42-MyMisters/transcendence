import { useAtom } from "jotai";
import { passwordInputModalAtom } from "../../components/atom/ModalAtom";
import { PressKey } from "../../event/pressKey";

import "../../styles/PasswordModal.css";

export default function PasswordModal() {
  const [pwInputModal, setPwInputModal] = useAtom(passwordInputModalAtom);

  PressKey(["Escape"], () => {
    setPwInputModal(false);
  });

  return (
    <>
      <div className="PasswordModalBG"></div>
      <div className="PasswordModal">
        <div className="PasswordForm">
          <label htmlFor="Password">Password</label>
          <input id="Password" type="text"></input>
        </div>
        <button className="Password">Join</button>
        <button className="PasswordCancel" onClick={() => setPwInputModal(false)}>
          Cancel
        </button>
      </div>
    </>
  );
}
