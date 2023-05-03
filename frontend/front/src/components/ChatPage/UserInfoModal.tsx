import { useAtom } from "jotai";
import { userInfoModalAtom } from "../../components/atom/ModalAtom";
import { PressKey } from "../../event/pressKey";

import { IoCloseOutline } from "react-icons/io5";
import "../../styles/UserInfoModal.css";
import { UserInfoModalInfo } from "../atom/UserInfoModalAtom";
import * as chatAtom from "../../components/atom/ChatAtom";

export default function UserInfoModal() {
  const [userInfoModal, setUserInfoModal] = useAtom(userInfoModalAtom);
  const [userInfo, setUserInfo] = useAtom(UserInfoModalInfo);

  PressKey(["Escape"], () => {
    setUserInfoModal(false);
  });

  const Follow = () => {
    alert("follow");
  };

  const Invite = () => {
    alert("invite");
  }

  const Ignore = () => {
    alert("ignore");
  };

  const Kick = () => {
    alert("kick");
  };

  const Ban = () => {
    alert("ban");
  };

  const Mute = () => {
    alert("mute");
  };

  const Admin = () => {
    alert("admin");
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
        <div className="profile" >profile</div>
        <div className="kick" onClick={Kick}>kick</div>
        <div className="ban" onClick={Ban}>ban</div>
        <div className="mute" onClick={Mute}>mute</div>
        <div className="manager" onClick={Admin}>admin</div>
      </div>
    </>
  );
}
