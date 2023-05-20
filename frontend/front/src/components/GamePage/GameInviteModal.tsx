import { useAtomValue, useSetAtom } from "jotai";
import { PressKey } from "../../event/event.util";
import "../../styles/GameInviteModal.css";
import { isPrivateAtom, gameInviteInfoAtom } from "../atom/GameAtom";
import { gameInviteModalAtom } from "../atom/ModalAtom";

export default function GameInviteModal() {
  const setGameInviteModal = useSetAtom(gameInviteModalAtom);
  const setIsPrivate = useSetAtom(isPrivateAtom);
  const gameInviteInfo = useAtomValue(gameInviteInfoAtom);

  PressKey(["Escape"], () => {
    setGameInviteModal(false);
  });

  return (
    <>
      <div className="GameInviteModalBG" />
      <div className="GameInviteModal">
        <div className="GameInviteModalTxt">{`Game Invite\nfrom ${gameInviteInfo}`}</div>
        <button
          className="GameInviteModalAcceptBtn"
          onClick={() => {
            setGameInviteModal(false);
            setIsPrivate(true);
          }}
        >
          Accept
        </button>
        <button
          className="GameInviteModalDeclineBtn"
          onClick={() => {
            setGameInviteModal(false);
          }}
        >
          Decline
        </button>
      </div>
    </>
  );
}
