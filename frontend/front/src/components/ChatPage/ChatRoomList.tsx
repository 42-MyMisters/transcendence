import { useAtom } from "jotai";
import { roomModalAtom } from "../../components/atom/ModalAtom";

import "../../styles/ChatList.css";
import ChatRoom from "../objects/ChatRoom";

import { socket } from "../../socket/socket";
import * as chatAtom from '../atom/SocketAtom';
import { useEffect } from 'react';

export default function ChatRoomList() {
  const [roomModal, setRoomModal] = useAtom(roomModalAtom);
  const [roomList, setRoomList] = useAtom(chatAtom.roomListAtom);
  // let arrayRoomList = Object.entries(roomList);

  useEffect(() => {
    // arrayRoomList = Object.entries(roomList);
  }, [roomList]);


  return (
    <div className="ChatListBG ChatRoomList">
      <div className="ChatListTxt">Chatting List</div>
      <div className="ChatRoomListPlusBtn" onClick={() => setRoomModal(true)} />
      <div className="ChatRooms">
        {
          // arrayRoomList.map((key) => (
          // <ChatRoom roomName={roomList[key[0]].roomName} type={roomList[key[0]].type}></ChatRoom>
          // ))
        }
        <ChatRoom roomName="room1" type="Protected"></ChatRoom>
        <ChatRoom roomName="room2" type="Private"></ChatRoom>
      </div>
    </div>
  );
}
