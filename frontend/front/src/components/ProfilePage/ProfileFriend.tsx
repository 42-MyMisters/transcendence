import { useAtomValue } from "jotai";
import "../../styles/ProfilePage.css";
import * as chatAtom from "../atom/ChatAtom";
import { FollowingAtom, isMyProfileAtom } from "../atom/UserAtom";
import UserObj from "../objects/UserObj";

export default function ProfileFriend() {
  const userList = useAtomValue(chatAtom.userListAtom);
  const followingList = useAtomValue(chatAtom.followingListAtom);
  const isMyProfile = useAtomValue(isMyProfileAtom);
  const following = useAtomValue(FollowingAtom);

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
                    nickName={userList[Number(key)]?.userDisplayName ?? ''}
                    profileImage={userList[Number(key)].userProfileUrl}
                    status={userList[Number(key)]?.userStatus ?? 'offline'}
                    chat={'normal'}
                    power="member"
                    callBack={() => { }}
                    defaultColor={"#111"}
                  />
                );
              })
              : following.map((key) => {
                return (
                  <UserObj
                    key={key.uid}
                    uid={Number(key.uid)}
                    nickName={key.nickname}
                    profileImage={key.profileUrl}
                    status={userList[Number(key.uid)]?.userStatus ?? 'offline'}
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
