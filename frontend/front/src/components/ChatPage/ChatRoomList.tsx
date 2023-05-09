import { useAtom } from "jotai";
import { roomModalAtom } from "../../components/atom/ModalAtom";
import { passwordInputModalAtom } from "../../components/atom/ModalAtom";

import "../../styles/ChatList.css";
import ChatRoom from "../objects/ChatRoom";

import * as chatAtom from "../atom/ChatAtom";
import * as socket from "../../socket/chat.socket";

export default function ChatRoomList() {
  const [, setRoomModal] = useAtom(roomModalAtom);
  const [, setPasswordModal] = useAtom(passwordInputModalAtom);
  const [focusRoom, setFocusRoom] = useAtom(chatAtom.focusRoomAtom);
  const [roomList, setRoomList] = useAtom(chatAtom.roomListAtom);
  const [, setClickRoom] = useAtom(chatAtom.clickRoomAtom);
  const [, setRoomSetting] = useAtom(chatAtom.roomSettingAtom);
  const [adminConsole] = useAtom(chatAtom.adminConsoleAtom);

  const roomClickHandler = (roomId: number) => {

    if (roomList[roomId].isJoined) {
      setFocusRoom(roomId);
    } else if (roomList[roomId].roomType === "protected") {
      setClickRoom(roomId);
      setPasswordModal(true);
    } else {
      socket.emitRoomJoin({ adminConsole, roomList, setRoomList, focusRoom, setFocusRoom }, roomId)
    }
  };

  const roomPlusBtnHandler = () => {
    setRoomSetting(false);
    setRoomModal(true)
  };

  return (
    <div className="ChatListBG ChatRoomList">
      <div className="ChatListTxt">Chatting List</div>
      <div className="ChatRoomListPlusBtn" onClick={roomPlusBtnHandler} />
      <div className="ChatRooms">
        {
          Object.entries(roomList).map((key) => (
            roomList[Number(key[0])].roomType !== "dm" && roomList[Number(key[0])].isJoined === true
              ? <ChatRoom
                key={key[0]}
                roomId={Number(key[0])}
                roomName={roomList[Number(key[0])]?.roomName}
                type={roomList[Number(key[0])]?.roomType}
                isJoin={roomList[Number(key[0])]?.isJoined}
                callBack={roomClickHandler}
              />
              : ''
          ))
        }
        {
          Object.entries(roomList).map((key) => (
            roomList[Number(key[0])].roomType !== "dm" && roomList[Number(key[0])].isJoined === false
              ? <ChatRoom
                key={key[0]}
                roomId={Number(key[0])}
                roomName={roomList[Number(key[0])]?.roomName}
                type={roomList[Number(key[0])]?.roomType}
                isJoin={roomList[Number(key[0])]?.isJoined}
                callBack={roomClickHandler}
              />
              : ''
          ))
        }
      </div>
    </div>
  );
}
