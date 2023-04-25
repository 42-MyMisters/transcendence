import "../../styles/ProfilePage.css";
import UserObj from "../objects/UserObj";

import { useAtom } from "jotai";
import { UserAtom } from "../atom/UserAtom";

export default function ProfileFriend() {
  const [userInfo, setUserInfo] = useAtom(UserAtom);

  return (
    <div className="ProfileFriendFrame">
      <div className="ProfileFriendTitle">friends</div>
      <div className="ProfileFriendBG">
        <div className="ProfileFriendList">
          <UserObj
            nickName="yotak"
            profileImage="/smile.png"
            status="online"
            power=""
            callBack={() => {}}
          ></UserObj>
        </div>
      </div>
    </div>
  );
}
