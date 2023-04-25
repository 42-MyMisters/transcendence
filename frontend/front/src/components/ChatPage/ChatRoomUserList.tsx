import { useAtom } from "jotai";
import { inviteModalAtom } from "../../components/atom/ModalAtom";
import { userInfoModalAtom } from "../../components/atom/ModalAtom";

import "../../styles/ChatRoomUserList.css";
import UserObj from "../objects/UserObj";

export default function ChatRoomUserList() {
  const [inviteModal, setInviteModal] = useAtom(inviteModalAtom);
  const [userInfoModal, setUserInfoModal] = useAtom(userInfoModalAtom);

  return (
    <div className="ChatRoomUserListBG">
      <div className="ChatRoomNameTxt">RoomName</div>
      <div className="ChatRoomSettingBtn" />
      <div className="ChatRoomInviteBtn" onClick={() => setInviteModal(true)} />
      <div className="ChatRoomExitBtn" />
      <div className="ChatRoomUsers">
        <UserObj
          nickName="User1"
          profileImage="/src/smile.png"
          status="online"
          power="Owner"
          callBack={() => setUserInfoModal(true)}
        />
        <UserObj
          nickName="User2"
          profileImage="/src/smile.png"
          status="ingame"
          power="Manager"
          callBack={() => setUserInfoModal(true)}
        />
      </div>
    </div>
  );
}
