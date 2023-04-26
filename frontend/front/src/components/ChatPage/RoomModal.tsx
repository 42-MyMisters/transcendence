import { useAtom } from "jotai";
import { roomModalAtom } from "../atom/ModalAtom";
import { PressKey } from "../../event/pressKey";

import "../../styles/RoomModal.css";

import { useState } from 'react';
import * as chatAtom from '../atom/SocketAtom';

import * as socket from "../../socket/socket";

export default function RoomModal() {
  const [roomModal, setRoomModal] = useAtom(roomModalAtom);
  const [roomName, setRoomName] = useState("");
  const [roomPass, setRoomPass] = useState("");
  const [roomCheck, setRoomCheck] = useState(false);
  const [roomList, setRoomList] = useAtom(chatAtom.roomListAtom);

  PressKey(["Escape"], () => { setRoomModal(false); });

  const acceptHandler = () => {
    socket.emitRoomCreate({ roomList, setRoomList }, roomName, roomCheck, roomPass);
    setRoomModal(false);
  };

  return (
    <>
      <div className="RoomModalBG"></div>
      <div className="RoomModal">
        <div className="PrivacyChecker">
          <input type="checkbox" id="PrivacyCheckbox" name="Privacy" value="false" onChange={(e) => setRoomCheck(e.target.checked)} checked={roomCheck} ></input>
          <label htmlFor="PrivacyCheckbox">Private</label>
        </div>
        <div className="RoomNameForm">
          <label htmlFor="RoomName">RoomName</label>
          <input id="RoomName" type="text" placeholder="방 이름을 입력하세요." onChange={(e) => setRoomName(e.target.value)}></input>
        </div>
        <div className="PasswordFrom">
          <label htmlFor="Password">Password</label>
          <input id="Password" type="password" placeholder="비밀 번호를 입력하세요." onChange={(e) => setRoomPass(e.target.value)}></input>
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
