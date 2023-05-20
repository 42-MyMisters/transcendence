import { useAtomValue, useSetAtom } from "jotai";
import { PressKey } from "../../event/event.util";
import "../../styles/GameInviteModal.css";
import { isPrivateAtom, gameInviteInfoAtom, gameInviteCheckAtom } from "../atom/GameAtom";
import { gameInviteModalAtom } from "../atom/ModalAtom";
import * as chatAtom from "../../components/atom/ChatAtom";
import * as socket from "../../socket/chat.socket";
import { useNavigate } from "react-router-dom";

export default function GameInviteModal() {
  const setGameInviteModal = useSetAtom(gameInviteModalAtom);
  const setIsPrivate = useSetAtom(isPrivateAtom);
  const setGameInviteInfo = useSetAtom(gameInviteInfoAtom);
  const userList = useAtomValue(chatAtom.userListAtom);
  const gameInviteCheck = useAtomValue(gameInviteCheckAtom);
  const adminConsole = useAtomValue(chatAtom.adminConsoleAtom);
  const navigate = useNavigate();

  PressKey(["Escape"], () => {
    setGameInviteModal(false);
  });

  return (
    <>
      <div className="GameInviteModalBG" />
      <div className="GameInviteModal">
        <div className="GameInviteModalTxt">{`Game Invite\nfrom ${userList[gameInviteCheck].userDisplayName}`}</div>
        <button
          className="GameInviteModalAcceptBtn"
          onClick={() => {
            setGameInviteModal(false);
            setIsPrivate(true);
            setGameInviteInfo({ gameType: 'invite', userId: gameInviteCheck })
            socket.emitGameInviteCheck({ adminConsole }, gameInviteCheck, 'accept');
            navigate("/game");
          }}
        >
          Accept
        </button>
        <button
          className="GameInviteModalDeclineBtn"
          onClick={() => {
            setGameInviteModal(false);
            socket.emitGameInviteCheck({ adminConsole }, gameInviteCheck, 'decline');
          }}
        >
          Decline
        </button>
      </div>
    </>
  );
}
