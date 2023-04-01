import "../../styles/ChatRoomUserList.css";

export default function ChatRoomUserList() {
  return (
    <div className="ChatRoomUserListBG">
      <div className="ChatRoomNameTxt">RoomName</div>
      <div className="ChatRoomSettingBtn" />
      <div className="ChatRoomInviteBtn" />
      <div className="ChatRoomExitBtn" />
      <div className="ChatRoomUsers">
        <div>User1</div>
        <div>User2</div>
      </div>
    </div>
  );
}
