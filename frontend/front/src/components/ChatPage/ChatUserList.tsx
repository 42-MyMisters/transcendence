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
    alert(`DM with ${userList[targetId]?.userDisplayName}`);
    if (roomList[targetId] === undefined) {
      console.log('init');
      // init logic
      // create room in roomList, and opposite user's roomList
      socket.emitDmRoomCreate({ roomList }, targetId);
      // bring dm histroy from server
      // setFocusRoom(targetId);
    } else {
      console.log('show');
      // show logic
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
          Object.entries(dmHistoryList).map((key) => (
            followingList[Number(key[0])] !== undefined
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
        {
          Object.entries(userList).map((key) => (
            userList[Number(key[0])].userStatus === 'offline'
              ? ''
              : followingList[Number(key[0])] === undefined && dmHistoryList[Number(key[0])] === undefined
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
      </div>
    </div>
  );
}
