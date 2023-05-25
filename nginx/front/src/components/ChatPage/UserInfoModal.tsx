import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { userInfoModalAtom } from "../atom/ModalAtom";
import * as api from "../../event/api.request";
import { AdminLogPrinter, PressKey } from "../../event/event.util";

import { IoCloseOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import * as chatAtom from "../atom/ChatAtom";
import { refreshTokenAtom } from "../atom/LoginAtom";
import { FollowingAtom, GameRecordAtom, isMyProfileAtom, ProfileAtom } from "../atom/UserAtom";
import * as socket from "../../socket/chat.socket";
import "../../styles/UserInfoModal.css";
import { gameInviteInfoAtom, isGameStartedAtom, isPrivateAtom, p2IdAtom } from "../atom/GameAtom";
import { UserInfoModalInfo } from "../atom/UserInfoModalAtom";

export default function UserInfoModal() {
  const setUserInfoModal = useSetAtom(userInfoModalAtom);
  const userInfo = useAtomValue(UserInfoModalInfo);
  const [roomList, setRoomList] = useAtom(chatAtom.roomListAtom);
  const userList = useAtomValue(chatAtom.userListAtom);
  const [followingList, setFollowingList] = useAtom(chatAtom.followingListAtom);
  const focusRoom = useAtomValue(chatAtom.focusRoomAtom);
  const [blockList, setBlockList] = useAtom(chatAtom.blockListAtom);
  const setIsPrivate = useSetAtom(isPrivateAtom);
  const setGameInviteInfo = useSetAtom(gameInviteInfoAtom);
  const setIsGameStart = useSetAtom(isGameStartedAtom);
  const setRefreshToken = useSetAtom(refreshTokenAtom);
  const adminConsole = useAtomValue(chatAtom.adminConsoleAtom);
  const setIsMyProfile = useSetAtom(isMyProfileAtom);
  const setProfile = useSetAtom(ProfileAtom);
  const navigate = useNavigate();
  const setP2Id = useSetAtom(p2IdAtom);
  const setFollowing = useSetAtom(FollowingAtom);
  const setGameRecord = useSetAtom(GameRecordAtom);

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

  async function getGameRecordHandler() {
    const getProfileResponse = await api.GetOtherGameRecord(adminConsole, setGameRecord, userInfo.uid);
    if (getProfileResponse === 401) {
      const refreshResponse = await api.RefreshToken(adminConsole);
      if (refreshResponse !== 201) {
        logOutHandler();
      } else {
        const getProfileResponse = await api.GetOtherGameRecord(
          adminConsole,
          setGameRecord,
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

  async function getFollowingHandler() {
    const getProfileResponse = await api.GetOtherFollowing(adminConsole, setFollowing, userInfo.uid);
    if (getProfileResponse === 401) {
      const refreshResponse = await api.RefreshToken(adminConsole);
      if (refreshResponse !== 201) {
        logOutHandler();
      } else {
        const getProfileResponse = await api.GetOtherFollowing(
          adminConsole,
          setFollowing,
          userInfo.uid
        );
        if (getProfileResponse === 401) {
          logOutHandler();
        } else {
          await getGameRecordHandler();
        }
      }
    } else {
      await getGameRecordHandler();
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
          await getFollowingHandler();
        }
      }
    } else {
      await getFollowingHandler();
    }
  }

  const isDefaultUser = userInfo.uid < 3 ? true : false;

  const infoModalOff = () => {
    setUserInfoModal(false);
  };

  PressKey(["Escape"], () => {
    setUserInfoModal(false);
  });

  const Follow = async () => {
    if (isDefaultUser) return;
    await followHandler();
    infoModalOff();
  };

  const callbackInvite = () => {
    AdminLogPrinter(adminConsole, `invite ${userInfo.uid}`);
    socket.emitGameInvite({ adminConsole, navigate }, userInfo.uid, userInfo.nickName);
    setGameInviteInfo({ gameType: 'invite', userId: userInfo.uid });
    setIsPrivate(true);
    setP2Id(userInfo.uid);
    setIsGameStart(false);
    infoModalOff();
    navigate("/game");
  };
  const callbackObserv = () => {
    AdminLogPrinter(adminConsole, `observ ${userInfo.uid}`);
    infoModalOff();
    setGameInviteInfo({ gameType: 'observe', userId: userInfo.uid });
    setIsPrivate(false);
    setIsGameStart(true);
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
    setFollowing([]);
    setGameRecord([]);
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
