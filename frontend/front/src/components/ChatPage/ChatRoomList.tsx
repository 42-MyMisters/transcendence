import { useAtom } from "jotai";
import { roomModalAtom } from "../../components/atom/ModalAtom";

import "../../styles/ChatList.css";
import ChatRoom from "../objects/ChatRoom";

import { socket } from "../../socket/socket";
import * as chatAtom from '../atom/SocketAtom';

export default function ChatRoomList() {
  const [roomModal, setRoomModal] = useAtom(roomModalAtom);
  const [roomList, setRoomList] = useAtom(chatAtom.roomListAtom);


  return (
    <div className="ChatListBG ChatRoomList">
      <div className="ChatListTxt">Chatting List</div>
      <div className="ChatRoomListPlusBtn" onClick={() => setRoomModal(true)} />
      <div className="ChatRooms">
        <ChatRoom roomName="room1" type="Protected"></ChatRoom>
        <ChatRoom roomName="room2" type="Private"></ChatRoom>
      </div>
    </div>
  );
}
