import { useAtom } from "jotai";
import "../../styles/GameInviteModal.css";
import { gameInviteModalAtom } from "../atom/ModalAtom";

export default function GameInviteModal({
  from,
  AcceptBtn,
  DeclineBtn,
}: {
  from: string;
  AcceptBtn: () => void;
  DeclineBtn: () => void;
}) {
  const [, setGameInviteModal] = useAtom(gameInviteModalAtom);

  return (
    <>
      <div className="GameInviteModalBG" />
      <div className="GameInviteModal">
        <div className="GameInviteModalTxt">{`Game Invite\nfrom ${from}`}</div>
        <button className="GameInviteModalAcceptBtn" onClick={AcceptBtn}>
          Accept
        </button>
        <button
          className="GameInviteModalDeclineBtn"
          onClick={() => {
            DeclineBtn;
            setGameInviteModal(false);
          }}
        >
          Decline
        </button>
      </div>
    </>
  );
}
