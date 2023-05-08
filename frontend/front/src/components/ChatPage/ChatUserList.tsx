import "../../styles/ChatList.css";
import UserObj from "../objects/UserObj";

import { useAtom } from "jotai";
import * as chatAtom from '../atom/ChatAtom';
import { UserAtom } from "../atom/UserAtom";
import * as socket from "../../socket/chat.socket";

// 채팅페이지 왼쪽 아래 total User list
export default function ChatUserList() {
  const [userList] = useAtom(chatAtom.userListAtom);
  const [userInfo] = useAtom(UserAtom);
  const [blockList] = useAtom(chatAtom.blockListAtom);
  const [dmHistoryList] = useAtom(chatAtom.dmHistoryListAtom);
  const [followingList] = useAtom(chatAtom.followingListAtom);
  const [roomList, setRoomList] = useAtom(chatAtom.roomListAtom);
  const [focusRoom, setFocusRoom] = useAtom(chatAtom.focusRoomAtom);
  // const [dmList, setDmList] = useAtom(chatAtom.dmListAtom);
  // const [focusDm, setFocusDm] = useAtom(chatAtom.focusDmAtom);

  const DM = (targetId: number) => {
    if (roomList[targetId] === undefined) {
      socket.emitDmRoomCreate(targetId);
    } else {
      setFocusRoom(targetId);
    }
  };

  return (
    <div className="ChatListBG ChatUserList">
      <div className="ChatListTxt">User List</div>
      <div className="ChatUsers">
        {
          Object.entries(followingList).map((key) => (
            <UserObj
              key={Number(key[0])}
              uid={Number(key[0])}
              nickName={userList[Number(key[0])]?.userDisplayName}
              profileImage={userList[Number(key[0])]?.userProfileUrl}
              status={userList[Number(key[0])]?.userStatus}
              chat={'normal'}
              power="member"
              callBack={DM}
            />
          ))
        }
        {
          Object.entries(userList).map((key) => (
            userList[Number(key[0])].userStatus === 'offline'
              ? ''
              : followingList[Number(key[0])] === undefined
                ? <UserObj
                  key={Number(key[0])}
                  uid={Number(key[0])}
                  nickName={userList[Number(key[0])]?.userDisplayName}
                  profileImage={userList[Number(key[0])]?.userProfileUrl}
                  status={userList[Number(key[0])]?.userStatus}
                  chat={'normal'}
                  power="member"
                  callBack={DM}
                />
                : ''
          ))
        }
        {
          Object.entries(dmHistoryList).map((key) => (
            followingList[Number(key[0])] !== undefined && userList[Number(key[0])] !== undefined
              ? ''
              : <UserObj
                key={Number(key[0])}
                uid={Number(key[0])}
                nickName={userList[Number(key[0])]?.userDisplayName}
                profileImage={userList[Number(key[0])]?.userProfileUrl}
                status={userList[Number(key[0])]?.userStatus}
                chat={'normal'}
                power="member"
                callBack={DM}
              />
          ))
        }
      </div>
    </div>
  );
}
