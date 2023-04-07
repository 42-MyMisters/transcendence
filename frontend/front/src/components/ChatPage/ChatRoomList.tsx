import { useAtom } from "jotai";
import { roomModalAtom } from "../../components/atom/ModalAtom";

import "../../styles/ChatList.css";

export default function ChatRoomList() {
  const [roomModal, setRoomModal] = useAtom(roomModalAtom);

  return (
    <div className="ChatListBG ChatRoomList">
      <div className="ChatListTxt">Chatting List</div>
      <div className="ChatRoomListPlusBtn" onClick={() => setRoomModal(true)} />
      <div className="ChatRooms">
        <div>Room1</div>
        <div>Room2</div>
      </div>
    </div>
  );
}
