import "../../styles/ProfilePage.css";
import UserObj from "../objects/UserObj";

import { useAtom } from "jotai";
import { UserAtom } from "../atom/UserAtom";

export default function ProfileFriend() {
  const [userInfo] = useAtom(UserAtom);

  return (
    <div className="ProfileFriendFrame">
      <div className="ProfileFriendTitle">friends</div>
      <div className="ProfileFriendBG">
        <div className="ProfileFriendList">
          {userInfo.followings
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
            : null}
        </div>
      </div>
    </div>
  );
}
