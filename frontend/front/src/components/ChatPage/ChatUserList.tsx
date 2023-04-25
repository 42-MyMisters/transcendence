import "../../styles/ChatList.css";
import UserObj from "../objects/UserObj";

// 채팅페이지 왼쪽 아래 total User list
export default function ChatUserList() {
  return (
    <div className="ChatListBG ChatUserList">
      <div className="ChatListTxt">User List</div>
      <div className="ChatUsers">
        <UserObj
          nickName="User1"
          profileImage="/src/smile.png"
          status="online"
          power=""
          callBack={() => {}}
        />
        <UserObj
          nickName="User2"
          profileImage="/src/smile.png"
          status="ingame"
          power=""
          callBack={() => {}}
        />
      </div>
    </div>
  );
}
