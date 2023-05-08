import { useAtom } from "jotai";
import {
  userInfoModalAtom,
  inviteModalAtom
} from "../../components/atom/ModalAtom";
import { useCallback } from "react";

import "../../styles/ChatRoomUserList.css";
import UserObj from "../objects/UserObj";

import * as chatAtom from '../atom/ChatAtom';
import { UserAtom } from "../atom/UserAtom";
import * as socket from "../../socket/chat.socket";
import { roomModalAtom } from "../../components/atom/ModalAtom";

export default function ChatRoomUserList() {
  const [inviteModal, setInviteModal] = useAtom(inviteModalAtom);
  const [userInfoModal, setUserInfoModal] = useAtom(userInfoModalAtom);

  const [userInfo, setUserInfo] = useAtom(UserAtom);
  const [userList,] = useAtom(chatAtom.userListAtom);
  const [roomList, setRoomList] = useAtom(chatAtom.roomListAtom);
  const [focusRoom, setFocusRoom] = useAtom(chatAtom.focusRoomAtom);
  const [, setRoomSetting] = useAtom(chatAtom.roomSettingAtom);
  const [, setRoomModal] = useAtom(roomModalAtom);
  const [, setRoomSettingIsPrivate] = useAtom(chatAtom.roomSettingIsPrivateAtom);
  const [, setRoomSettingCurrentRoomName] = useAtom(chatAtom.roomSettingCurrentRoomNameAtom);

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

  const onClickLeave = () => {
    socket.emitRoomLeave({ roomList, setRoomList, focusRoom, setFocusRoom }, focusRoom);
  };

  const onClickSetting = () => {
    if (roomList[focusRoom].roomType === 'private') {
      setRoomSettingIsPrivate(true);
    } else {
      setRoomSettingIsPrivate(false);
    }
    setRoomSettingCurrentRoomName(roomList[focusRoom].roomName);
    setRoomSetting(true);
    setRoomModal(true);
  };

  return (
    <div className="ChatRoomUserListBG">
      <div className="ChatRoomNameTxt">
        {
          focusRoom === -1
            ? 'My Room'
            : roomList[focusRoom].roomType === 'private'
              ? 'Private Room ' + roomList[focusRoom]?.roomName
              : roomList[focusRoom]?.roomName
        }
      </div>
      {
        focusRoom === -1
          ? '' :
          roomList[focusRoom]?.detail?.myRoomPower !== 'owner'
            ? '' : <div className="ChatRoomSettingBtn" onClick={onClickSetting} />
      }
      {
        focusRoom === -1
          ? ''
          : roomList[focusRoom]?.roomType === 'dm'
            ? ''
            : <div className="ChatRoomInviteBtn" onClick={onClickInvite} />
      }
      {
        focusRoom === -1
          ? ''
          : roomList[focusRoom]?.roomType === 'dm'
            ? ''
            : roomList[focusRoom]?.detail?.myRoomStatus === 'mute'
              ? ''
              : <div className="ChatRoomExitBtn" onClick={onClickLeave} />
      }
      <div className="ChatRoomUsers">
        {
          focusRoom === -1
            ? <UserObj
              key="-2"
              uid={userInfo.uid ?? -2}
              nickName={userInfo.nickname}
              profileImage={userInfo.profileUrl}
              status={userList[Number(userInfo.uid)]?.userStatus}
              chat={roomList[focusRoom]?.detail?.userList[userInfo.uid]?.userRoomStatus ?? 'normal'}
              power="member"
              callBack={onClickInfo}
            />
            : Object?.entries(roomList[focusRoom]?.detail?.userList!)?.map((key) => (
              <UserObj
                key={Number(key[0])}
                uid={Number(key[0])}
                nickName={userList[Number(key[0])]?.userDisplayName}
                profileImage={userList[Number(key[0])]?.userProfileUrl}
                status={userList[Number(key[0])]?.userStatus}
                chat={roomList[focusRoom]?.detail?.userList[Number(key[0])]?.userRoomStatus ?? 'normal'}
                power={key[1]?.userRoomPower}
                callBack={onClickInfo}
              />
            ))
        }
      </div>
    </div>
  );
}
