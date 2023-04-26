import "../../styles/ProfilePage.css";
import UserObj from "../objects/UserObj";

import { useAtom } from "jotai";
import { UserAtom } from "../atom/UserAtom";
import { ReactElement } from "react";

export default function ProfileFriend() {
  const [userInfo, setUserInfo] = useAtom(UserAtom);
  const followings = userInfo?.followings.map(
    (following: {
      uid: number;
      nickname: string;
      profileUrl: string;
      status: string;
      createdAt: string;
      followings: [string];
    }): ReactElement => (
      <UserObj
        nickName={following.nickname}
        profileImage={following.profileUrl}
        status={following.status}
        power="profile"
        callBack={() => {}}
      />
    )
  );

  return (
    <div className="ProfileFriendFrame">
      <div className="ProfileFriendTitle">friends</div>
      <div className="ProfileFriendBG">
        <div className="ProfileFriendList">
          {followings}
          {/* <UserObj
            nickName="yotak"
            profileImage="/smile.png"
            status="online"
            power=""
            callBack={() => {}}
          /> */}
        </div>
      </div>
    </div>
  );
}
