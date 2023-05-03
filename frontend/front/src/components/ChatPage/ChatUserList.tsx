import "../../styles/ChatList.css";
import UserObj from "../objects/UserObj";

import { useAtom } from "jotai";
import * as chatAtom from '../atom/ChatAtom';
import { UserAtom } from "../atom/UserAtom";

// 채팅페이지 왼쪽 아래 total User list
export default function ChatUserList() {
  const [userList] = useAtom(chatAtom.userListAtom);
  const [userHistory] = useAtom(chatAtom.userHistoryAtom);
  const [userInfo] = useAtom(UserAtom);
  const [userBlockList] = useAtom(chatAtom.userBlockListAtom);
  const [dmHistoryList] = useAtom(chatAtom.dmHistoryListAtom);
  const [followingList] = useAtom(chatAtom.followingListAtom);

  return (
    <div className="ChatListBG ChatUserList">
      <div className="ChatListTxt">User List</div>
      <div className="ChatUsers">
        {
          Object.entries(followingList).map((key) => (
            userList[Number(key[0])] !== undefined
              ? ''
              : <UserObj
                key={Number(key[0])}
                nickName={userHistory[Number(key[0])]?.userDisplayName}
                profileImage={userHistory[Number(key[0])]?.userProfileUrl}
                status={userHistory[Number(key[0])]?.userStatus}
                power=""
                callBack={() => { }}
              />
          ))
        }
        {
          Object.entries(dmHistoryList).map((key) => (
            userList[Number(key[0])] !== undefined
              ? ''
              : followingList[Number(key[0])] !== undefined
                ? ''
                : <UserObj
                  key={Number(key[0])}
                  nickName={userHistory[Number(key[0])]?.userDisplayName}
                  profileImage={userHistory[Number(key[0])]?.userProfileUrl}
                  status={userHistory[Number(key[0])]?.userStatus}
                  power=""
                  callBack={() => { }}
                />
          ))
        }
        {
          Object.entries(userList).map((key) => (
            // Number(key[0]) === userInfo.uid // NOTE: 내 아이디는 안보이게
            //   ? '' :
            userHistory[Number(key[0])].userStatus === 'offline'
              ? ''
              : <UserObj
                key={Number(key[0])}
                nickName={userHistory[Number(key[0])]?.userDisplayName}
                profileImage={userHistory[Number(key[0])]?.userProfileUrl}
                status={userHistory[Number(key[0])]?.userStatus}
                power=""
                callBack={() => { }} // TODO: need to implement callback
              />
          ))
        }
      </div>
    </div>
  );
}
