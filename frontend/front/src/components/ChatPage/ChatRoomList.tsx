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

  // useEffect(() => {
  //   // arrayRoomList = Object.entries(roomList);
  // }, [roomList]);

  const roomClickHandler = (roomName: string) => {
    console.log(`roomCLickHandler ${roomName}`);
  };


  return (
    <div className="ChatListBG ChatRoomList">
      <div className="ChatListTxt">Chatting List</div>
      <div className="ChatRoomListPlusBtn" onClick={() => setRoomModal(true)} />
      <div className="ChatRooms">
        {
          Object.entries(roomList).map((key) => (
            <ChatRoom key={Number(key[0])} roomName={roomList[Number(key[0])].roomName} type={roomList[Number(key[0])].roomType}></ChatRoom>
          ))
        }
        <ChatRoom roomName="room1" type="Protected" ></ChatRoom>
        <ChatRoom roomName="room2" type="Private"></ChatRoom>
      </div>
    </div >
  );
}
