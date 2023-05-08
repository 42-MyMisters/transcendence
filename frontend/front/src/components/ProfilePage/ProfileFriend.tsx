import "../../styles/ProfilePage.css";
import UserObj from "../objects/UserObj";

import { useAtom } from "jotai";
import { UserAtom } from "../atom/UserAtom";
import * as chatAtom from "../atom/ChatAtom";

export default function ProfileFriend() {
  const [userInfo] = useAtom(UserAtom);
  const [userList, setUserList] = useAtom(chatAtom.userListAtom);
  const [followingList, setFollowingList] = useAtom(chatAtom.followingListAtom);

  return (
    <div className="ProfileFriendFrame">
      <div className="ProfileFriendTitle">friends</div>
      <div className="ProfileFriendBG">
        <div className="ProfileFriendList">
          {/* {userInfo.followings
            ? userInfo.followings.map((key) => {
              return (
                <UserObj
                  key={key.uid}
                  uid={Number(key.uid)}
                  nickName={key.nickname}
                  profileImage={key.profileUrl}
                  status={key.status}
                  chat={'normal'}
                  power="member"
                  callBack={() => { }}
                  defaultColor={"#111"}
                />
              );
            })
            : null} */}
          {
            Object.keys(followingList).map((key) => {
              return (
                <UserObj
                  key={key}
                  uid={Number(key)}
                  nickName={userList[Number(key)].userDisplayName}
                  profileImage={userList[Number(key)].userProfileUrl}
                  status={userList[Number(key)].userStatus}
                  chat={'normal'}
                  power="member"
                  callBack={() => { }}
                  defaultColor={"#111"}
                />
              );
            })
          }
        </div>
      </div>
    </div>
  );
}
