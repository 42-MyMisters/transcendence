import "../../styles/RoomInviteModal.css";

type Props = {
  setInviteModal: (isShow: boolean) => void;
};

export default function RoomInviteModal({ setInviteModal }: Props) {
  return (
    <>
      <div className="RoomInviteModalBG"></div>
      <div className="RoomInviteModal">
        <div className="InviteForm">
          <label htmlFor="Invite">NickName</label>
          <input id="Invite" type="text"></input>
        </div>
        <button className="Invite">Invite</button>
        <button className="InviteCancel" onClick={() => setInviteModal(false)}>
          Cancel
        </button>
      </div>
    </>
  );
}
