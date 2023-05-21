import { useAtom, useSetAtom, useAtomValue } from "jotai";
import { userInfoModalAtom } from "../../components/atom/ModalAtom";
import { AdminLogPrinter, PressKey } from "../../event/event.util";
import * as api from "../../event/api.request";

import { IoCloseOutline } from "react-icons/io5";
import "../../styles/UserInfoModal.css";
import { UserInfoModalInfo } from "../atom/UserInfoModalAtom";
import * as chatAtom from "../../components/atom/ChatAtom";
import { refreshTokenAtom } from "../../components/atom/LoginAtom";
import * as socket from "../../socket/chat.socket";
import { useNavigate } from "react-router-dom";
import { UserAtom, isMyProfileAtom, ProfileAtom } from "../../components/atom/UserAtom";
import { isPrivateAtom, gameInviteInfoAtom } from "../atom/GameAtom";

export default function UserInfoModal() {
  const [userInfoModal, setUserInfoModal] = useAtom(userInfoModalAtom);
  const [userInfo, setUserInfo] = useAtom(UserInfoModalInfo);
  const [roomList, setRoomList] = useAtom(chatAtom.roomListAtom);
  const [userList, setUserList] = useAtom(chatAtom.userListAtom);
  const [followingList, setFollowingList] = useAtom(chatAtom.followingListAtom);
  const [focusRoom] = useAtom(chatAtom.focusRoomAtom);
  const [blockList, setBlockList] = useAtom(chatAtom.blockListAtom);
  const setIsPrivate = useSetAtom(isPrivateAtom);
  const setGameInviteInfo = useSetAtom(gameInviteInfoAtom);
  const myInfo = useAtomValue(UserAtom);

  const navigate = useNavigate();
  const [, setRefreshToken] = useAtom(refreshTokenAtom);
  const [adminConsole] = useAtom(chatAtom.adminConsoleAtom);
  const [, setIsMyProfile] = useAtom(isMyProfileAtom);
  const [, setProfile] = useAtom(ProfileAtom);

  const logOutHandler = () => {
    api.LogOut(adminConsole, setRefreshToken, navigate, "/");
  };

  async function followHandler() {
    const doOrUndo: boolean = followingList[userInfo.uid] === undefined ? true : false;

    const followResponse = await api.DoFollow(
      adminConsole,
      userInfo.uid,
      doOrUndo,
      followingList,
      setFollowingList,
      userList
    );
    if (followResponse === 401) {
      const refreshResponse = await api.RefreshToken(adminConsole);
      if (refreshResponse !== 201) {
        logOutHandler();
      } else {
        const followResponse = await api.DoFollow(
          adminConsole,
          userInfo.uid,
          doOrUndo,
          followingList,
          setFollowingList,
          userList
        );
        if (followResponse === 401) {
          logOutHandler();
        }
      }
    }
  }

  async function getProfileHandler() {
    const getProfileResponse = await api.GetOtherProfile(adminConsole, setProfile, userInfo.uid);
    if (getProfileResponse === 401) {
      const refreshResponse = await api.RefreshToken(adminConsole);
      if (refreshResponse !== 201) {
        logOutHandler();
      } else {
        const getProfileResponse = await api.GetOtherProfile(
          adminConsole,
          setProfile,
          userInfo.uid
        );
        if (getProfileResponse === 401) {
          logOutHandler();
        } else {
          navigate("/profile");
        }
      }
    } else {
      navigate("/profile");
    }
  }

  const isDefaultUser = userInfo.uid < 3 ? true : false;

  const infoModalOff = () => {
    setUserInfoModal(false);
  };

  PressKey(["Escape"], () => {
    setUserInfoModal(false);
  });

  const Follow = () => {
    if (isDefaultUser) return;
    followHandler();
    infoModalOff();
  };

  const callbackInvite = () => {
    socket.emitGameInvite({ adminConsole, navigate }, userInfo.uid, userInfo.nickName);
    setGameInviteInfo({ gameType: 'invite', userId: userInfo.uid });
    setIsPrivate(true);
    infoModalOff();
    navigate("/game");
  };
  const callbackObserv = () => {
    infoModalOff();
    setGameInviteInfo({ gameType: 'observe', userId: userInfo.uid });
    setIsPrivate(false);
    navigate("/game");
  };
  const callbackError = () => {
    infoModalOff();
    alert('유저가 게임 대기열에 있습니다.')
  };

  const Invite = () => {
    if (isDefaultUser) return;
    if (userList[userInfo.uid].userStatus === 'offline') {
      alert('유저가 오프라인 상태입니다.');
    } else {
      socket.emitGameStatus(userInfo.uid, callbackInvite, callbackObserv, callbackError)
    }
  };

  const Ignore = () => {
    if (isDefaultUser) return;
    const doOrUndo: boolean = blockList[userInfo.uid] === undefined ? true : false;
    socket.emitBlockUser({ adminConsole, blockList, setBlockList }, userInfo.uid, doOrUndo);
    infoModalOff();
  };

  const Profile = async () => {
    if (isDefaultUser) return;
    infoModalOff();
    setIsMyProfile(false);
    await getProfileHandler();
  };

  const Kick = () => {
    if (isDefaultUser) return;
    socket.emitRoomInAction(
      { adminConsole, roomList, setRoomList },
      focusRoom,
      "kick",
      userInfo.uid
    );
    infoModalOff();
  };

  const Ban = () => {
    if (isDefaultUser) return;
    socket.emitRoomInAction(
      { adminConsole, roomList, setRoomList },
      focusRoom,
      "ban",
      userInfo.uid
    );
    infoModalOff();
  };

  const Mute = () => {
    if (isDefaultUser) return;
    socket.emitRoomInAction(
      { adminConsole, roomList, setRoomList },
      focusRoom,
      "mute",
      userInfo.uid
    );
    infoModalOff();
  };

  const Admin = () => {
    if (isDefaultUser) return;
    socket.emitRoomInAction(
      { adminConsole, roomList, setRoomList },
      focusRoom,
      "admin",
      userInfo.uid
    );
    infoModalOff();
  };

  return (
    <>
      <div className="UserInfoModalBG"></div>
      <div className="UserInfoModal">
        <div className="NickName">{userInfo.nickName}</div>
        <div
          className="ProfileImg"
          style={{
            backgroundImage: `url(${userInfo.profileImage})`,
            backgroundSize: "200px",
          }}
        ></div>
        <div
          className="CloseBtn"
          onClick={() => {
            setUserInfoModal(false);
          }}
        >
          <IoCloseOutline />
        </div>
        <div className="follow" onClick={Follow}>
          {userInfo.isFollow ? "unfollow" : "follow"}
        </div>
        <div className="invite" onClick={Invite}>
          {userInfo.userState !== "inGame" ? "invite" : "observe"}
        </div>
        <div className="ignore" onClick={Ignore}>
          {userInfo.isIgnored ? "unignore" : "ignore"}
        </div>
        <div className="profile" onClick={Profile}>
          profile
        </div>
        {roomList[focusRoom]?.detail?.myRoomPower! === "member" ? (
          ""
        ) : userInfo.userPower === "owner" ? (
          ""
        ) : (
          <div className="kick" onClick={Kick}>
            kick
          </div>
        )}
        {roomList[focusRoom]?.detail?.myRoomPower! === "member" ? (
          ""
        ) : userInfo.userPower === "owner" ? (
          ""
        ) : (
          <div className="ban" onClick={Ban}>
            ban
          </div>
        )}
        {roomList[focusRoom]?.detail?.myRoomPower! === "member" ? (
          ""
        ) : userInfo.userPower === "owner" ? (
          ""
        ) : roomList[focusRoom]?.detail?.userList[userInfo.uid]?.userRoomStatus === "mute" ? (
          ""
        ) : (
          <div className="mute" onClick={Mute}>
            mute
          </div>
        )}
        {roomList[focusRoom]?.detail?.myRoomPower! !== "owner" ? (
          ""
        ) : userInfo.userPower === "admin" ? (
          ""
        ) : (
          <div className="manager" onClick={Admin}>
            admin
          </div>
        )}
      </div>
    </>
  );
}
