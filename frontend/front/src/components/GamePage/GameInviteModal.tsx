import { useAtomValue, useSetAtom } from "jotai";
import { PressKey } from "../../event/event.util";
import "../../styles/GameInviteModal.css";
import { isPrivateAtom, gameInviteInfoAtom, gameinviteFromAtom } from "../atom/GameAtom";
import { gameInviteModalAtom } from "../atom/ModalAtom";
import * as chatAtom from "../../components/atom/ChatAtom";
import * as socket from "../../socket/chat.socket";
import { useNavigate } from "react-router-dom";
import { useEffect } from 'react';

export default function GameInviteModal() {
  const setGameInviteModal = useSetAtom(gameInviteModalAtom);
  const setIsPrivate = useSetAtom(isPrivateAtom);
  const setGameInviteInfo = useSetAtom(gameInviteInfoAtom);
  const userList = useAtomValue(chatAtom.userListAtom);
  const gameInviteFrom = useAtomValue(gameinviteFromAtom);
  const adminConsole = useAtomValue(chatAtom.adminConsoleAtom);
  const navigate = useNavigate();

  const declineHandler = () => {
    setGameInviteModal(false);
    socket.emitGameInviteCheck({ adminConsole }, gameInviteFrom, 'decline');
  }

  const acceptHandler = () => {
    socket.emitGameInviteCheck({ adminConsole }, gameInviteFrom, 'accept');
    setGameInviteInfo({ gameType: 'invite', userId: gameInviteFrom })
    setIsPrivate(true);
    setGameInviteModal(false);
    navigate("/game");
  }

  PressKey(["Escape"], () => {
    declineHandler();
  });

  return (
    <>
      <div className="GameInviteModalBG" />
      <div className="GameInviteModal">
        <div className="GameInviteModalTxt">{`Game Invite\nfrom ${userList[gameInviteFrom].userDisplayName}`}</div>
        <button
          className="GameInviteModalAcceptBtn"
          onClick={acceptHandler}
        >
          Accept
        </button>
        <button
          className="GameInviteModalDeclineBtn"
          onClick={declineHandler}
        >
          Decline
        </button>
      </div >
    </>
  );
}
