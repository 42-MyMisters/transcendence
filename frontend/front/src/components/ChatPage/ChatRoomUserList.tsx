import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import {
  inviteModalAtom, userInfoModalAtom
} from "../../components/atom/ModalAtom";

import "../../styles/ChatRoomUserList.css";
import UserObj from "../objects/UserObj";

import { roomModalAtom } from "../../components/atom/ModalAtom";
import * as socket from "../../socket/chat.socket";
import * as chatAtom from '../atom/ChatAtom';
import { UserAtom } from "../atom/UserAtom";

export default function ChatRoomUserList() {
  const setInviteModal = useSetAtom(inviteModalAtom);
  const setUserInfoModal = useSetAtom(userInfoModalAtom);
  const userInfo = useAtomValue(UserAtom);
  const userList = useAtomValue(chatAtom.userListAtom);
  const [roomList, setRoomList] = useAtom(chatAtom.roomListAtom);
  const [focusRoom, setFocusRoom] = useAtom(chatAtom.focusRoomAtom);
  const setRoomSetting = useSetAtom(chatAtom.roomSettingAtom);
  const setRoomModal = useSetAtom(roomModalAtom);
  const setRoomSettingIsPrivate = useSetAtom(chatAtom.roomSettingIsPrivateAtom);
  const setRoomSettingCurrentRoomName = useSetAtom(chatAtom.roomSettingCurrentRoomNameAtom);
  const adminConsole = useAtomValue(chatAtom.adminConsoleAtom);

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
    socket.emitRoomLeave({ adminConsole, roomList, setRoomList, focusRoom, setFocusRoom }, focusRoom);
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
            : ''
        }
        {
          focusRoom !== -1
            ? Object?.entries(roomList[focusRoom]?.detail?.userList!)?.map((key) => (
              userList[Number(key[0])]?.userStatus !== 'offline'
                ? < UserObj
                  key={Number(key[0])}
                  uid={Number(key[0])}
                  nickName={userList[Number(key[0])]?.userDisplayName}
                  profileImage={userList[Number(key[0])]?.userProfileUrl}
                  status={userList[Number(key[0])]?.userStatus}
                  chat={roomList[focusRoom]?.detail?.userList[Number(key[0])]?.userRoomStatus ?? 'normal'}
                  power={key[1]?.userRoomPower}
                  callBack={onClickInfo}
                />
                : ''
            ))
            : ''
        }
        {
          focusRoom !== -1
            ? Object?.entries(roomList[focusRoom]?.detail?.userList!)?.map((key) => (
              userList[Number(key[0])]?.userStatus === 'offline'
                ? < UserObj
                  key={Number(key[0])}
                  uid={Number(key[0])}
                  nickName={userList[Number(key[0])]?.userDisplayName}
                  profileImage={userList[Number(key[0])]?.userProfileUrl}
                  status={userList[Number(key[0])]?.userStatus}
                  chat={roomList[focusRoom]?.detail?.userList[Number(key[0])]?.userRoomStatus ?? 'normal'}
                  power={key[1]?.userRoomPower}
                  callBack={onClickInfo}
                />
                : ''
            ))
            : ''
        }
      </div>
    </div>
  );
}
