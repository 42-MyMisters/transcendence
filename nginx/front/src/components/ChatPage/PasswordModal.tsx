import { keyboardKey } from '@testing-library/user-event';
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useState } from 'react';
import { passwordInputModalAtom } from "../atom/ModalAtom";
import { PressKey } from "../../event/event.util";

import "../../styles/PasswordModal.css";

import { useAutoFocus } from '../../event/event.util';
import * as socket from "../../socket/chat.socket";
import * as chatAtom from "../atom/ChatAtom";

export default function PasswordModal() {
  const setPwInputModal = useSetAtom(passwordInputModalAtom);
  const [password, setPassword] = useState('');
  const [focusRoom, setFocusRoom] = useAtom(chatAtom.focusRoomAtom);
  const [roomList, setRoomList] = useAtom(chatAtom.roomListAtom);
  const clickRoom = useAtomValue(chatAtom.clickRoomAtom);
  const adminConsole = useAtomValue(chatAtom.adminConsoleAtom);
  const passwordInputRef = useAutoFocus();

  PressKey(["Escape"], () => {
    setPwInputModal(false);
    setPassword('');
  });

  const handleJoinRoom = () => {
    setPwInputModal(false);
    socket.emitRoomJoin({ adminConsole, roomList, setRoomList, focusRoom, setFocusRoom }, clickRoom, password);
    setPassword('');
  }

  const handleEnterEvent = (e: keyboardKey) => {
    if (e.key === 'Enter') {
      handleJoinRoom();
    }
  }

  return (
    <>
      <div className="PasswordModalBG"></div>
      <div className="PasswordModal">
        <div className="PasswordForm">
          <label htmlFor="Password">Password</label>
          <input id="Password" ref={passwordInputRef} type="password" maxLength={20} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => handleEnterEvent(e)}></input>
        </div>
        <button className="Password" onClick={handleJoinRoom}>Join</button>
        <button className="PasswordCancel" onClick={() => setPwInputModal(false)}>
          Cancel
        </button>
      </div>
    </>
  );
}
