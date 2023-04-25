import { useAtom } from "jotai";
import { userInfoModalAtom } from "../../components/atom/ModalAtom";
import { PressKey } from "../../event/pressKey";

import { IoCloseOutline } from "react-icons/io5";
import "../../styles/UserInfoModal.css";
import { UserInfoModalInfo } from "../atom/UserInfoModalAtom";

export default function UserInfoModal() {
  const [userInfoModal, setUserInfoModal] = useAtom(userInfoModalAtom);
  const [userInfo, setUserInfo] = useAtom(UserInfoModalInfo);

  PressKey(["Escape"], () => {
    setUserInfoModal(false);
  });

  return (
    <>
      <div className="UserInfoModalBG"></div>
      <div className="UserInfoModal">
        <div className="NickName">{userInfo.nickName}</div>
        <div className="ProfileImg"></div>
        <div
          className="CloseBtn"
          onClick={() => {
            setUserInfoModal(false);
          }}
        >
          <IoCloseOutline />
        </div>
        <div className="follow">{userInfo.isFollow ? "unfollow" : "follow"}</div>
        <div className="invite">{userInfo.userState != "ingame" ? "invite" : "observe"}</div>
        <div className="ignore">{userInfo.isIgnored ? "unignore" : "ignore"}</div>
        <div className="profile">profile</div>
        <div className="kick">kick</div>
        <div className="ban">ban</div>
        <div className="mute">mute</div>
        <div className="manager">manager</div>
      </div>
    </>
  );
}
