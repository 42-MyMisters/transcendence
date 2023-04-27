import { useAtom } from "jotai";
import { inviteModalAtom } from "../../components/atom/ModalAtom";
import { userInfoModalAtom } from "../../components/atom/ModalAtom";
import { useCallback } from "react";

import "../../styles/ChatRoomUserList.css";
import UserObj from "../objects/UserObj";

import * as chatAtom from '../atom/SocketAtom';

export default function ChatRoomUserList() {
  const [inviteModal, setInviteModal] = useAtom(inviteModalAtom);
  const [userInfoModal, setUserInfoModal] = useAtom(userInfoModalAtom);

  const [userList,] = useAtom(chatAtom.userListAtom);
  const [roomList,] = useAtom(chatAtom.roomListAtom);
  const [focusRoom,] = useAtom(chatAtom.focusRoomAtom);

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
        {
          focusRoom === -1 ? null :
            // Object.entries(inRoomUserList).map((key) => (
            Object.entries(roomList[focusRoom]?.detail?.userList!).map((key) => (
              <UserObj
                key={Number(key[0])}
                nickName={userList[Number(key[0])].userDisplayName}
                profileImage={userList[Number(key[0])].userProfileUrl}
                status={userList[Number(key[0])].userStatus}
                power={key[1].userRoomPower}
                callBack={onClickInfo}
              />
            ))
        }

        < UserObj
          key="-1"
          nickName="User1"
          profileImage="/smile.png"
          status="online"
          power="Owner"
          callBack={onClickInfo}
        />
        <UserObj
          key="-2"
          nickName="User2"
          profileImage="/smile.png"
          status="ingame"
          power="Manager"
          callBack={onClickInfo}
        />
      </div>
    </div>
  );
}
