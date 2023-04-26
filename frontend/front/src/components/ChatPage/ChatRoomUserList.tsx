import { useAtom } from "jotai";
import { inviteModalAtom } from "../../components/atom/ModalAtom";
import { userInfoModalAtom } from "../../components/atom/ModalAtom";
import { ReactElement, ReactNode, useCallback } from 'react';

import "../../styles/ChatRoomUserList.css";
import UserObj from "../objects/UserObj";

import * as chatAtom from '../atom/SocketAtom';
import type * as chatType from '../../socket/chatting.dto';
import { useEffect } from "react";

export default function ChatRoomUserList() {
  const [inviteModal, setInviteModal] = useAtom(inviteModalAtom);
  const [userInfoModal, setUserInfoModal] = useAtom(userInfoModalAtom);

  const [userList, _] = useAtom(chatAtom.userListAtom);
  const [roomList, setRoomList] = useAtom(chatAtom.roomListAtom);
  const [focusRoom, setFocusRoom] = useAtom(chatAtom.focusRoomAtom);
  const [inRoomUserList, setInRoomUserList] = useAtom(chatAtom.inRoomUserListAtom);


  useEffect(() => {
    setInRoomUserList({ ...roomList[focusRoom]?.detail?.userList } ?? { ...inRoomUserList });
  }, [focusRoom]);

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
            Object.entries(inRoomUserList).map((key) => (
              <UserObj
                key={Number(key[0])}
                nickName={userList[Number(key[0])].userDisplayName}
                profileImage={userList[Number(key[0])].userProfileUrl}
                status={userList[Number(key[0])].userStatus}
                power={inRoomUserList[Number(key[0])].userRoomPower}
                callBack={onClickInfo}
              />
            ))
        }

        < UserObj
          key="-1"
          nickName="User1"
          profileImage="/src/smile.png"
          status="online"
          power="Owner"
          callBack={onClickInfo}
        />
        <UserObj
          key="-2"
          nickName="User2"
          profileImage="/src/smile.png"
          status="ingame"
          power="Manager"
          callBack={onClickInfo}
        />
      </div>
    </div>
  );
}
