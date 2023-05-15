import "../../styles/ProfilePage.css";
import UserObj from "../objects/UserObj";

import { useAtom } from "jotai";
import { UserAtom, isMyProfileAtom, ProfileAtom } from "../atom/UserAtom";
import * as chatAtom from "../atom/ChatAtom";

export default function ProfileFriend() {
  const [userInfo] = useAtom(UserAtom);
  const [userList, setUserList] = useAtom(chatAtom.userListAtom);
  const [followingList, setFollowingList] = useAtom(chatAtom.followingListAtom);
  const [isMyProfile] = useAtom(isMyProfileAtom);
  const [profile] = useAtom(ProfileAtom);

  return (
    <div className="ProfileFriendFrame">
      <div className="ProfileFriendTitle">friends</div>
      <div className="ProfileFriendBG">
        <div className="ProfileFriendList">
          {
            isMyProfile
              ? Object.keys(followingList)?.map((key) => {
                return (
                  <UserObj
                    key={key}
                    uid={Number(key)}
                    nickName={userList[Number(key)].userDisplayName}
                    profileImage={userList[Number(key)].userProfileUrl}
                    status={userList[Number(key)].userStatus ?? 'offline'}
                    chat={'normal'}
                    power="member"
                    callBack={() => { }}
                    defaultColor={"#111"}
                  />
                );
              })
              : profile.followings?.map((key) => {
                return (
                  <UserObj
                    key={key.uid}
                    uid={Number(key.uid)}
                    nickName={key.nickname}
                    profileImage={key.profileUrl}
                    status={userList[Number(key.uid)].userStatus ?? 'offline'}
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
