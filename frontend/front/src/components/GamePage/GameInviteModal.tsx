import { useAtom } from "jotai";
import "../../styles/GameInviteModal.css";
import { gameInviteModalAtom } from "../atom/ModalAtom";
import { isPrivateAtom } from "../atom/GameAtom";

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
  const [, setIsPrivate] = useAtom(isPrivateAtom);

  return (
    <>
      <div className="GameInviteModalBG" />
      <div className="GameInviteModal">
        <div className="GameInviteModalTxt">{`Game Invite\nfrom ${from}`}</div>
        <button
          className="GameInviteModalAcceptBtn"
          onClick={() => {
            AcceptBtn();
            setGameInviteModal(false);
            setIsPrivate(true);
          }}
        >
          Accept
        </button>
        <button
          className="GameInviteModalDeclineBtn"
          onClick={() => {
            DeclineBtn();
            setGameInviteModal(false);
          }}
        >
          Decline
        </button>
      </div>
    </>
  );
}
