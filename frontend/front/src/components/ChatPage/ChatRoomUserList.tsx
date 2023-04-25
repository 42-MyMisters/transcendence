import { useAtom } from "jotai";
import { inviteModalAtom } from "../../components/atom/ModalAtom";
import { userInfoModalAtom } from "../../components/atom/ModalAtom";
import { useCallback } from 'react';

import "../../styles/ChatRoomUserList.css";
import UserObj from "../objects/UserObj";

export default function ChatRoomUserList() {
  const [inviteModal, setInviteModal] = useAtom(inviteModalAtom);
  const [userInfoModal, setUserInfoModal] = useAtom(userInfoModalAtom);

  const onClickInfo = useCallback(() => {
    const handleSetRoomModal = () => {
      setUserInfoModal(true);
    };
    handleSetRoomModal();
  }, []);

  const onClickInvite = useCallback(() => {
    const handleSetRoomModal = () => {
      setInviteModal(true);
    };
    handleSetRoomModal();
  }, []);

  return (
    <div className="ChatRoomUserListBG">
      <div className="ChatRoomNameTxt">RoomName</div>
      <div className="ChatRoomSettingBtn" />
      <div className="ChatRoomInviteBtn" onClick={onClickInvite} />
      <div className="ChatRoomExitBtn" />
      <div className="ChatRoomUsers">
        <UserObj
          nickName="User1"
          status="online"
          power="Owner"
          callBack={onClickInfo}
        />
        <UserObj
          nickName="User2"
          status="ingame"
          power="Manager"
          callBack={onClickInfo}
        />
      </div>
    </div>
  );
}
