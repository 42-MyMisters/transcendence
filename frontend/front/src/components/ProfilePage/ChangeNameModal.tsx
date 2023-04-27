import { useAtom } from "jotai";
import { changeNameModalAtom } from "../atom/ModalAtom";
import { PressKey } from "../../event/pressKey";

import "../../styles/ProfileModal.css";

export default function ChangeNameModal() {
  const [changeNameModal, setchangeNameModal] = useAtom(changeNameModalAtom);

  PressKey(["Escape"], () => {
    setchangeNameModal(false);
  });

  return (
    <>
      <div className="ChangeNameModalBG"></div>
      <div className="ChangeNameModal">
        <div className="SaveNameForm">
          <label htmlFor="SaveName">New Nickname</label>
          <input id="SaveName" type="text"></input>
        </div>
        <button className="SaveName">Save</button>
        <button className="SaveNameCancel" onClick={() => setchangeNameModal(false)}>
          Cancel
        </button>
      </div>
    </>
  );
}
