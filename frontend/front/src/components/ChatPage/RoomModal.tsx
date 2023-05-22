import { useAtom, useSetAtom } from "jotai";
import { PressKey } from "../../event/event.util";
import { roomModalAtom } from "../atom/ModalAtom";

import "../../styles/RoomModal.css";

import { keyboardKey } from '@testing-library/user-event';
import { useState } from 'react';
import { useAutoFocus } from '../../event/event.util';
import * as socket from "../../socket/chat.socket";
import * as chatAtom from '../atom/ChatAtom';

export default function RoomModal() {
  const setRoomModal = useSetAtom(roomModalAtom);
  const [roomName, setRoomName] = useState("");
  const [roomPass, setRoomPass] = useState("");
  const [roomCheck, setRoomCheck] = useState(false);
  const roomList = useAtomValue(chatAtom.roomListAtom);
  const focusRoom = useAtomValue(chatAtom.focusRoomAtom);
  const roomSetting = useAtomValue(chatAtom.roomSettingAtom);
  const [roomSettingIsPrivate, setRoomSettingIsPrivate] = useAtom(chatAtom.roomSettingIsPrivateAtom);
  const [roomSettingCurrentRoomName, setRoomSettingCurrentRoomName] = useAtom(chatAtom.roomSettingCurrentRoomNameAtom);
  const [adminConsole] = useAtom(chatAtom.adminConsoleAtom);
  const roomInputRef = useAutoFocus();

  PressKey(["Escape"], () => {
    setRoomModal(false);
  });


  const acceptHandler = () => {
    if (roomSetting) {
      const trimRoomName = roomSettingCurrentRoomName.trim();
      if (trimRoomName.length < 1) {
        alert('방 이름을 입력해주세요.');
      } else {
        socket.emitRoomEdit(adminConsole, focusRoom, roomSettingCurrentRoomName, roomSettingIsPrivate, roomPass, roomList[focusRoom].roomType);
        setRoomModal(false);
      }
    } else {
      const trimRoomName = roomName.trim();
      if (trimRoomName.length < 1) {
        alert('방 이름을 입력해주세요.');
      } else {
        socket.emitRoomCreate(adminConsole, roomName, roomCheck, roomPass);
        setRoomModal(false);
      }
    }
    setRoomName("");
    setRoomPass("");
  };


  const handleEnterEvent = (e: keyboardKey) => {
    if (e.key === 'Enter') {
      acceptHandler();
    }
  }

  return (
    <>
      <div className="RoomModalBG"></div>
      <div className="RoomModal">
        <div className="PrivacyChecker">
          {
            !roomSetting
              ? < input type="checkbox" id="PrivacyCheckbox" name="Privacy" value="false" onChange={(e) => setRoomCheck(e.target.checked)} checked={roomCheck} ></input>
              : < input type="checkbox" id="PrivacyCheckbox" name="Privacy" value="false" onChange={(e) => setRoomSettingIsPrivate(e.target.checked)} checked={roomSettingIsPrivate} ></input>
          }
          <label htmlFor="PrivacyCheckbox">Private</label>
        </div>
        <div className="RoomNameForm">
          <label htmlFor="RoomName">RoomName</label>
          {
            !roomSetting
              ? <input id="RoomName" ref={roomInputRef} maxLength={12} minLength={1} type="text" placeholder="방 이름을 입력하세요." onChange={(e) => setRoomName(e.target.value)} onKeyDown={(e) => handleEnterEvent(e)}></input>
              : <input id="RoomName" ref={roomInputRef} maxLength={12} minLength={1} type="text" placeholder="방 이름을 입력하세요." value={roomSettingCurrentRoomName} onChange={(e) => setRoomSettingCurrentRoomName(e.target.value)} onKeyDown={(e) => handleEnterEvent(e)}></input>
          }
        </div>
        <div className="PasswordFrom">
          <label htmlFor="Password">Password</label>
          <input id="Password" maxLength={20} minLength={4} type="password" placeholder="비밀 번호를 입력하세요." onChange={(e) => setRoomPass(e.target.value)}></input>
        </div>
        <button className="Accept" onClick={acceptHandler}>Accept</button>
        {/* <button className="Accept" >Accept</button> */}
        <button className="RoomCancel" onClick={() => setRoomModal(false)}>
          Cancel
        </button>
      </div >
    </>
  );
}
