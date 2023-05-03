import { useAtom } from "jotai";
import { inviteModalAtom } from "../../components/atom/ModalAtom";
import { userInfoModalAtom } from "../../components/atom/ModalAtom";
import { useCallback } from "react";

import "../../styles/ChatRoomUserList.css";
import UserObj from "../objects/UserObj";

import * as chatAtom from '../atom/ChatAtom';
import { UserAtom } from "../atom/UserAtom";
import * as socket from "../../socket/chat.socket";

export default function ChatRoomUserList() {
  const [inviteModal, setInviteModal] = useAtom(inviteModalAtom);
  const [userInfoModal, setUserInfoModal] = useAtom(userInfoModalAtom);

  const [userInfo, setUserInfo] = useAtom(UserAtom);
  const [userList,] = useAtom(chatAtom.userListAtom);
  const [roomList, setRoomList] = useAtom(chatAtom.roomListAtom);
  const [focusRoom, setFocusRoom] = useAtom(chatAtom.focusRoomAtom);

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

  return (
    <div className="ChatRoomUserListBG">
      <div className="ChatRoomNameTxt">
        {
          focusRoom === -1 ? '시작의 방' : roomList[focusRoom]?.roomName
        }
      </div>
      {
        focusRoom === -1
          ? '' :
          roomList[focusRoom]?.detail?.myRoomPower !== 'owner'
            ? '' : <div className="ChatRoomSettingBtn" />
      }
      {/* <div className="ChatRoomSettingBtn" /> */}
      {
        focusRoom === -1
          ? ''
          : <div className="ChatRoomInviteBtn" onClick={onClickInvite} />
      }
      {
        focusRoom === -1
          ? ''
          : <div className="ChatRoomExitBtn" onClick={onClickLeave} />
      }
      <div className="ChatRoomUsers">
        {
          focusRoom === -1
            ? <UserObj
              key="-2"
              nickName={userInfo.nickname}
              profileImage={userInfo.profileUrl}
              status={userList[Number(userInfo.uid)]?.userStatus}
              power="owner"
              callBack={onClickInfo}
            />
            : Object.entries(roomList[focusRoom]?.detail?.userList!).map((key) => (
              <UserObj
                key={Number(key[0])}
                nickName={userList[Number(key[0])]?.userDisplayName}
                profileImage={userList[Number(key[0])]?.userProfileUrl}
                status={userList[Number(key[0])]?.userStatus}
                power={key[1]?.userRoomPower}
                callBack={onClickInfo}
              />
            ))
        }
        {/* <UserObj
          key="-2"
          nickName="User2"
          profileImage="/smile.png"
          status="ingame"
          power="Manager"
          callBack={onClickInfo}
        /> */}
      </div>
    </div>
  );
}
