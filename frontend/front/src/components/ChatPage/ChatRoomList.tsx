import { useAtom } from "jotai";
import { roomModalAtom } from "../../components/atom/ModalAtom";

import "../../styles/ChatList.css";
import ChatRoom from "../objects/ChatRoom";

export default function ChatRoomList() {
  const [roomModal, setRoomModal] = useAtom(roomModalAtom);

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
