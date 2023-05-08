import "../../styles/ChatList.css";
import UserObj from "../objects/UserObj";

import { useAtom } from "jotai";
import * as chatAtom from '../atom/ChatAtom';
import { UserAtom } from "../atom/UserAtom";
import * as socket from "../../socket/chat.socket";
import type * as chatType from "../../socket/chat.dto";

// 채팅페이지 왼쪽 아래 total User list
export default function ChatUserList() {
  const [userList, setUserList] = useAtom(chatAtom.userListAtom);
  const [userInfo] = useAtom(UserAtom);
  const [blockList] = useAtom(chatAtom.blockListAtom);
  const [dmHistoryList] = useAtom(chatAtom.dmHistoryListAtom);
  const [followingList] = useAtom(chatAtom.followingListAtom);
  const [roomList, setRoomList] = useAtom(chatAtom.roomListAtom);
  const [focusRoom, setFocusRoom] = useAtom(chatAtom.focusRoomAtom);

  const DM = (targetId: number) => {
    if (roomList[targetId] === undefined) {
      socket.emitDmRoomCreate(targetId);
    } else {
      setFocusRoom(targetId);
      if (userList[targetId]?.dmStatus === 'unread') {
        const newDmUser: chatType.userDto = {};
        newDmUser[targetId] = {
          userDisplayName: userList[targetId].userDisplayName,
          userProfileUrl: userList[targetId].userProfileUrl,
          userStatus: userList[targetId].userStatus,
          dmStatus: 'read',
        };
        setUserList({ ...userList, ...newDmUser });
      }
    }
  };

  return (
    <div className="ChatListBG ChatUserList">
      <div className="ChatListTxt">User List</div>
      <div className="ChatUsers">
        <UserObj
          key={-42}
          uid={-42}
          nickName={'Follwing List'}
          profileImage={'https://static.thenounproject.com/png/5303769-200.png'}
          status={''}
          chat={'normal'}
          power="member"
          callBack={() => { }}
        />
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
              dm={userList[Number(key[0])]?.dmStatus === 'unread' ? true : false}
              focusList={'userList'}
            />
          ))
        }
        <UserObj
          key={-43}
          uid={-43}
          nickName={''}
          profileImage={''}
          status={''}
          chat={'normal'}
          power="member"
          callBack={() => { }}
        />
        <UserObj
          key={-41}
          uid={-41}
          nickName={'Online List'}
          profileImage={'https://static.thenounproject.com/png/3720098-200.png'}
          status={''}
          chat={'normal'}
          power="member"
          callBack={() => { }}
        />
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
                  dm={userList[Number(key[0])]?.dmStatus === 'unread' ? true : false}
                  focusList={'userList'}
                />
                : ''
          ))
        }
        <UserObj
          key={-44}
          uid={-44}
          nickName={''}
          profileImage={''}
          status={''}
          chat={'normal'}
          power="member"
          callBack={() => { }}
        />
        <UserObj
          key={-40}
          uid={-40}
          nickName={'DM List'}
          profileImage={'https://static.thenounproject.com/png/4922698-200.png'}
          status={''}
          chat={'normal'}
          power="member"
          callBack={() => { }}
        />
        {
          Object.entries(dmHistoryList).map((key) => (
            followingList[Number(key[0])] !== undefined || userList[Number(key[0])]?.userStatus !== 'offline'
              ? ''
              : <UserObj
                key={Number(key[0])}
                uid={Number(key[0])}
                nickName={userList[Number(key[0])]?.userDisplayName}
                profileImage={userList[Number(key[0])]?.userProfileUrl}
                status={userList[Number(key[0])]?.userStatus}
                chat={'normal'}
                power="member"
                dm={userList[Number(key[0])]?.dmStatus === 'unread' ? true : false}
                callBack={DM}
                focusList={'userList'}
              />
          ))
        }
      </div>
    </div>
  );
}
