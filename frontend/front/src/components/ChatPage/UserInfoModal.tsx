import { useAtom } from "jotai";
import { userInfoModalAtom } from "../../components/atom/ModalAtom";
import { PressKey } from "../../event/pressKey";
import * as api from '../../event/api.request';

import { IoCloseOutline } from "react-icons/io5";
import "../../styles/UserInfoModal.css";
import { UserInfoModalInfo } from "../atom/UserInfoModalAtom";
import * as chatAtom from "../../components/atom/ChatAtom";
import { refreshTokenAtom } from "../../components/atom/LoginAtom";
import * as socket from "../../socket/chat.socket"
import { useNavigate } from 'react-router-dom';

export default function UserInfoModal() {
  const [userInfoModal, setUserInfoModal] = useAtom(userInfoModalAtom);
  const [userInfo, setUserInfo] = useAtom(UserInfoModalInfo);
  const [roomList, setRoomList] = useAtom(chatAtom.roomListAtom);
  const [userList, setUserList] = useAtom(chatAtom.userListAtom);
  const [followingList, setFollowingList] = useAtom(chatAtom.followingListAtom);
  const [focusRoom] = useAtom(chatAtom.focusRoomAtom);

  const navigate = useNavigate();
  const [, setRefreshToken] = useAtom(refreshTokenAtom);

  const logOutHandler = () => {
    api.LogOut(setRefreshToken, navigate, '/');
  };

  async function refreshTokenHandler(callback: (a: any, b: any, c: any, d: any, e: any) => {}, arg1: any, arg2: any, arg3: any, arg4: any, arg5: any) {
    const refreshResponse = await api.RefreshToken();
    if (refreshResponse !== 201) {
      logOutHandler();
    } else {
      callback(arg1, arg2, arg3, arg4, arg5);
    }
  }

  async function followHandler() {
    const doOrUndo: boolean = followingList[userInfo.uid] === undefined ? true : false;

    const unfollowResponse = await api.DoFollow(userInfo.uid, doOrUndo, followingList, setFollowingList, userList);
    if (unfollowResponse === 401) {
      console.log(`in response 401, try refresh token`);
      await refreshTokenHandler(api.DoFollow, userInfo.uid, doOrUndo, followingList, setFollowingList, userList);
    }
  };

  PressKey(["Escape"], () => {
    setUserInfoModal(false);
  });

  const Follow = () => {
    followHandler();
    setUserInfoModal(false);
  };

  const Invite = () => {
    alert("invite");
    setUserInfoModal(false);
  }

  const Ignore = () => {
    alert("ignore");
    setUserInfoModal(false);
  };

  const Profile = () => {
    alert("profile");
    setUserInfoModal(false);
  };

  const Kick = () => {
    socket.emitRoomInAction({ roomList, setRoomList }, focusRoom, "kick", userInfo.uid)
    setUserInfoModal(false);
  };

  const Ban = () => {
    socket.emitRoomInAction({ roomList, setRoomList }, focusRoom, "ban", userInfo.uid)
    setUserInfoModal(false);
  };

  const Mute = () => {
    socket.emitRoomInAction({ roomList, setRoomList }, focusRoom, "mute", userInfo.uid)
    setUserInfoModal(false);
  };

  const Admin = () => {
    socket.emitRoomInAction({ roomList, setRoomList }, focusRoom, "admin", userInfo.uid)
    setUserInfoModal(false);
  };



  return (
    <>
      <div className="UserInfoModalBG"></div>
      <div className="UserInfoModal">
        <div className="NickName">{userInfo.nickName}</div>
        <div className="ProfileImg" style={{
          backgroundImage: `url(${userInfo.profileImage})`,
        }}></div>
        <div
          className="CloseBtn"
          onClick={() => {
            setUserInfoModal(false);
          }}
        >
          <IoCloseOutline />
        </div>
        <div className="follow" onClick={Follow} >{userInfo.isFollow ? "unfollow" : "follow"}</div>
        <div className="invite" onClick={Invite} >{userInfo.userState != "ingame" ? "invite" : "observe"}</div>
        <div className="ignore" onClick={Ignore}>{userInfo.isIgnored ? "unignore" : "ignore"}</div>
        <div className="profile" onClick={Profile}>profile</div>
        {
          roomList[focusRoom]?.detail?.myRoomPower! === 'member'
            ? ''
            : userInfo.userPower === 'owner'
              ? ''
              : <div className="kick" onClick={Kick}>kick</div>
        }
        {
          roomList[focusRoom]?.detail?.myRoomPower! === 'member'
            ? ''
            : userInfo.userPower === 'owner'
              ? ''
              : <div className="ban" onClick={Ban}>ban</div>
        }
        {
          roomList[focusRoom]?.detail?.myRoomPower! === 'member'
            ? ''
            : userInfo.userPower === 'owner'
              ? ''
              : roomList[focusRoom]?.detail?.userList[userInfo.uid]?.userRoomStatus === 'mute'
                ? ''
                : <div className="mute" onClick={Mute}>mute</div>
        }
        {
          roomList[focusRoom]?.detail?.myRoomPower! !== 'owner'
            ? ''
            : userInfo.userPower === 'admin'
              ? ''
              : <div className="manager" onClick={Admin}>admin</div>
        }
      </div>
    </>
  );
}
