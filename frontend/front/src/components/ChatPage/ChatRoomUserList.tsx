import "../../styles/ChatRoomUserList.css";

type Props = {
  setUserInfoModal: (isShow: boolean) => void;
  setInviteModal: (isShow: boolean) => void;
};

export default function ChatRoomUserList({ setUserInfoModal, setInviteModal }: Props) {
  return (
    <div className="ChatRoomUserListBG">
      <div className="ChatRoomNameTxt">RoomName</div>
      <div className="ChatRoomSettingBtn" />
      <div className="ChatRoomInviteBtn" onClick={() => setInviteModal(true)} />
      <div className="ChatRoomExitBtn" />
      <div className="ChatRoomUsers">
        <div onClick={() => setUserInfoModal(true)}>User1</div>
        <div>User2</div>
      </div>
    </div>
  );
}
