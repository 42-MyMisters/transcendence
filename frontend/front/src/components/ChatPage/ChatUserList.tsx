import "../../styles/ChatList.css";
import UserObj from "../objects/UserObj";

import { useAtom } from "jotai";
import * as chatAtom from '../atom/ChatAtom';

// 채팅페이지 왼쪽 아래 total User list
export default function ChatUserList() {
  const [userList,] = useAtom(chatAtom.userListAtom);

  return (
    <div className="ChatListBG ChatUserList">
      <div className="ChatListTxt">User List</div>
      <div className="ChatUsers">
        {
          Object.entries(userList).map((key) => (
            <UserObj
              key={Number(key[0])}
              nickName={userList[Number(key[0])].userDisplayName}
              profileImage={userList[Number(key[0])].userProfileUrl}
              status={userList[Number(key[0])].userStatus}
              power=""
              callBack={() => { }} // TODO: need to implement callback
            />
          ))
        }
        <UserObj
          nickName="User1"
          profileImage="/smile.png"
          status="online"
          power=""
          callBack={() => { }}
        />
        <UserObj
          nickName="User2"
          profileImage="/smile.png"
          status="ingame"
          power=""
          callBack={() => { }}
        />
      </div>
    </div>
  );
}
