import { useAtom } from "jotai";
import { roomModalAtom } from "../atom/ModalAtom";
import { PressKey } from "../../event/pressKey";

import "../../styles/RoomModal.css";

export default function RoomModal() {
  const [roomModal, setRoomModal] = useAtom(roomModalAtom);

  PressKey(["Escape"], () => { setRoomModal(false); });

  return (
    <>
      <div className="RoomModalBG"></div>
      <div className="RoomModal">
        <div className="PrivacyChecker">
          <input type="checkbox" id="PrivacyCheckbox" name="Privacy" value="false"></input>
          <label htmlFor="PrivacyCheckbox">Private</label>
        </div>
        <div className="RoomNameForm">
          <label htmlFor="RoomName">RoomName</label>
          <input id="RoomName" type="text"></input>
        </div>
        <div className="PasswordFrom">
          <label htmlFor="Password">Password</label>
          <input id="Password" type="password"></input>
        </div>
        <button className="Accept">Accept</button>
        <button className="RoomCancel" onClick={() => setRoomModal(false)}>
          Cancel
        </button>
      </div>
    </>
  );
}
