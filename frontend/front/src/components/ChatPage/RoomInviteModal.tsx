import { useAtom } from "jotai";
import { inviteModalAtom } from "../../components/atom/ModalAtom";
import { PressKey } from "../../event/event.util";
import { useState } from 'react';
import { keyboardKey } from '@testing-library/user-event';
import "../../styles/RoomInviteModal.css";

import * as chatAtom from '../atom/ChatAtom';
import * as socket from "../../socket/chat.socket";
import { useAutoFocus } from '../../event/event.util';

export default function RoomInviteModal() {
  const [inviteModal, setInviteModal] = useAtom(inviteModalAtom);
  const [nickName, setNickName] = useState("");
  const [roomList, setRoomList] = useAtom(chatAtom.roomListAtom);
  const [focusRoom,] = useAtom(chatAtom.focusRoomAtom);
  const [adminConsole] = useAtom(chatAtom.adminConsoleAtom);
  const inviteInputRef = useAutoFocus();

  PressKey(["Escape"], () => { setInviteModal(false); });

  const handleInvite = () => {
    const trimNickname = nickName.trim();
    if (trimNickname.length < 1 || trimNickname.length > 8) {
      alert("Please enter a nickname between 1 and 8 characters");
    } else {
      socket.emitRoomInvite(adminConsole, focusRoom, nickName);
      setInviteModal(false);
    }
    setNickName("");
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
          <input id="Invite" ref={inviteInputRef} minLength={1} maxLength={8} type="text" value={nickName} onChange={(e) => setNickName(e.target.value)} onKeyDown={(e) => handleEnterEvent(e)}></input>
        </div>
        <button className="Invite" onClick={handleInvite}>Invite</button>
        <button className="InviteCancel" onClick={() => setInviteModal(false)}>
          Cancel
        </button>
      </div >
    </>
  );
}
