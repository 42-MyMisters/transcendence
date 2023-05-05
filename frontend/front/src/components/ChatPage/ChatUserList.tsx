import "../../styles/ChatList.css";
import UserObj from "../objects/UserObj";

import { useAtom } from "jotai";
import * as chatAtom from '../atom/ChatAtom';
import { UserAtom } from "../atom/UserAtom";

// 채팅페이지 왼쪽 아래 total User list
export default function ChatUserList() {
  const [userList] = useAtom(chatAtom.userListAtom);
  const [userInfo] = useAtom(UserAtom);
  const [blockList] = useAtom(chatAtom.blockListAtom);
  const [dmHistoryList] = useAtom(chatAtom.dmHistoryListAtom);
  const [followingList] = useAtom(chatAtom.followingListAtom);

  const DM = (uid: number) => {
    alert(`DM with ${userList[uid]?.userDisplayName}`);
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
              power=""
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
                power=""
                callBack={DM}
              />
          ))
        }
        {
          Object.entries(userList).map((key) => (
            // Number(key[0]) === userInfo.uid // NOTE: 내 아이디는 안보이게
            //   ? '' :
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
                  power=""
                  callBack={DM}
                />
                : ''
          ))
        }
      </div>
    </div>
  );
}
