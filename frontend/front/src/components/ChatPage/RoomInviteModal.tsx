import { keyboardKey } from '@testing-library/user-event';
import { useAtomValue, useSetAtom } from "jotai";
import { useState } from 'react';
import { inviteModalAtom } from "../../components/atom/ModalAtom";
import { PressKey } from "../../event/event.util";
import "../../styles/RoomInviteModal.css";

import { useAutoFocus } from '../../event/event.util';
import * as socket from "../../socket/chat.socket";
import * as chatAtom from '../atom/ChatAtom';

export default function RoomInviteModal() {
  const setInviteModal = useSetAtom(inviteModalAtom);
  const [nickName, setNickName] = useState("");
  const focusRoom = useAtomValue(chatAtom.focusRoomAtom);
  const adminConsole = useAtomValue(chatAtom.adminConsoleAtom);
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
