import { useAtom } from "jotai";
import { inviteModalAtom } from "../../components/atom/ModalAtom";
import { userInfoModalAtom } from "../../components/atom/ModalAtom";

import "../../styles/ChatRoomUserList.css";

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
        <div onClick={() => setUserInfoModal(true)}>User1</div>
        <div>User2</div>
      </div>
    </div>
  );
}
