import { useAtom } from "jotai";
import { inviteModalAtom } from "../../components/atom/ModalAtom";
import { PressKey } from "../../event/pressKey";
import { useState } from 'react';
import { keyboardKey } from '@testing-library/user-event';
import "../../styles/RoomInviteModal.css";

import * as chatAtom from '../atom/ChatAtom';
import * as socket from "../../socket/chat.socket";
export default function RoomInviteModal() {
  const [inviteModal, setInviteModal] = useAtom(inviteModalAtom);
  const [nickName, setNickName] = useState("");
  const [roomList, setRoomList] = useAtom(chatAtom.roomListAtom);
  const [focusRoom,] = useAtom(chatAtom.focusRoomAtom);

  PressKey(["Escape"], () => { setInviteModal(false); });

  const handleInvite = () => {
    socket.emitRoomInvite(focusRoom, nickName);
    setNickName("");
    setInviteModal(false);
  };

  const handleEnterEvent = (e: keyboardKey) => {
    if (e.key === 'Enter') {
      handleInvite();
    }
  }


  return (
    <>
      <div className="RoomInviteModalBG"></div>
      <div className="RoomInviteModal">
        <div className="InviteForm">
          <label htmlFor="Invite">NickName</label>
          <input id="Invite" type="text" value={nickName} onChange={(e) => setNickName(e.target.value)} onKeyDown={(e) => handleEnterEvent(e)}></input>
        </div>
        <button className="Invite" onClick={handleInvite}>Invite</button>
        <button className="InviteCancel" onClick={() => setInviteModal(false)}>
          Cancel
        </button>
      </div >
    </>
  );
}
