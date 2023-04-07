import { useAtom } from "jotai";
import { userInfoModalAtom } from "../../components/atom/ModalAtom";

import { IoCloseOutline } from "react-icons/io5";
import "../../styles/UserInfoModal.css";

export default function UserInfoModal() {
  const [userInfoModal, setUserInfoModal] = useAtom(userInfoModalAtom);
  return (
    <>
      <div className="UserInfoModalBG"></div>
      <div className="UserInfoModal">
        <div className="NickName">NickName</div>
        <div className="ProfileImg"></div>
        <div
          className="CloseBtn"
          onClick={() => {
            setUserInfoModal(false);
          }}
        >
          <IoCloseOutline />
        </div>
        <div className="follow">follow</div>
        <div className="invite">invite</div>
        <div className="ignore">ignore</div>
        <div className="profile">profile</div>
        <div className="kick">kick</div>
        <div className="ban">ban</div>
        <div className="mute">mute</div>
        <div className="manager">manager</div>
      </div>
    </>
  );
}