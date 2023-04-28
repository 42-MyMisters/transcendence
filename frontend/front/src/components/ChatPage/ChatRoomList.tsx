import { useAtom } from "jotai";
import { roomModalAtom } from "../../components/atom/ModalAtom";
import { passwordInputModalAtom } from "../../components/atom/ModalAtom";

import "../../styles/ChatList.css";
import ChatRoom from "../objects/ChatRoom";

import * as chatAtom from "../atom/ChatAtom";

export default function ChatRoomList() {
  const [, setRoomModal] = useAtom(roomModalAtom);
  const [, setPasswordModal] = useAtom(passwordInputModalAtom);

  const [roomList] = useAtom(chatAtom.roomListAtom);

  const roomClickHandler = (roomName: string) => {
    console.log(`roomCLickHandler ${roomName}`);
  };

  return (
    <div className="ChatListBG ChatRoomList">
      <div className="ChatListTxt">Chatting List</div>
      <div className="ChatRoomListPlusBtn" onClick={() => setRoomModal(true)} />
      <div className="ChatRooms">
        {Object.entries(roomList).map((key) => (
          <ChatRoom
            key={Number(key[0])}
            roomName={roomList[Number(key[0])].roomName}
            type={roomList[Number(key[0])].roomType}
            isJoin={roomList[Number(key[0])].isJoined || false}
          /> // TODO: need to implement callback onClick
        ))}
        {/* onClick={() => setPasswordModal(true)} */}
        <ChatRoom roomName="room1" type="protected" isJoin={false} ></ChatRoom>
        <ChatRoom roomName="room2" type="private" isJoin={false}></ChatRoom>
      </div>
    </div>
  );
}
