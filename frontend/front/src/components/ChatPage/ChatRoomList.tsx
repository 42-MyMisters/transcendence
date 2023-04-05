import "../../styles/ChatList.css";

// 채팅페이지 왼쪽 위 개설된 Room list
export default function ChatRoomList() {
  return (
    <div className="ChatListBG ChatRoomList">
      <div className="ChatListTxt">Chatting List</div>
      <div className="ChatRoomListPlusBtn" />
      <div className="ChatRooms">
        <div>Room1</div>
        <div>Room2</div>
      </div>
    </div>
  );
}
