import { useAtom } from "jotai";
import { passwordInputModalAtom } from "../../components/atom/ModalAtom";
import { PressKey } from "../../event/event.util";
import { keyboardKey } from '@testing-library/user-event';
import { useState } from 'react';

import "../../styles/PasswordModal.css";

import * as socket from "../../socket/chat.socket";
import * as chatAtom from "../atom/ChatAtom";

export default function PasswordModal() {
  const [pwInputModal, setPwInputModal] = useAtom(passwordInputModalAtom);
  const [password, setPassword] = useState('');
  const [focusRoom, setFocusRoom] = useAtom(chatAtom.focusRoomAtom);
  const [roomList, setRoomList] = useAtom(chatAtom.roomListAtom);
  const [clickRoom,] = useAtom(chatAtom.clickRoomAtom);
  const [adminConsole] = useAtom(chatAtom.adminConsoleAtom);

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
          <input id="Password" type="password" maxLength={20} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => handleEnterEvent(e)}></input>
        </div>
        <button className="Password" onClick={handleJoinRoom}>Join</button>
        <button className="PasswordCancel" onClick={() => setPwInputModal(false)}>
          Cancel
        </button>
      </div>
    </>
  );
}
