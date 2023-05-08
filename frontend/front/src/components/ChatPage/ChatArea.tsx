import "../../styles/ChatArea.css";
import SpeechBubble from "../objects/SpeechBubble";
import * as chatAtom from '../atom/ChatAtom';
import { UserAtom } from "../atom/UserAtom";
import { useAtom } from 'jotai';
import { keyboardKey } from '@testing-library/user-event';
import { useState } from 'react';
import * as socket from "../../socket/chat.socket";

export default function ChatArea() {
  const [focusRoom,] = useAtom(chatAtom.focusRoomAtom);
  const [roomList, setRoomList] = useAtom(chatAtom.roomListAtom);
  const [userList,] = useAtom(chatAtom.userListAtom);
  const [message, setMessage] = useState('');
  const [userInfo,] = useAtom(UserAtom);

  const defaultText: string = "채팅방을 선택해주세요.ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ방을 만들거나,    참여하면 채팅을 할 수 있습니다.";

  const handleSendMessage = () => {
    const tempMessage = message.trim();
    if (tempMessage !== '') {
      if (roomList[focusRoom]?.roomType === 'dm') {
        socket.emitDM(focusRoom, tempMessage);
      } else {
        socket.emitMessage({ roomList }, focusRoom, tempMessage);
      }
    }
    setMessage('');
  }

  const handleEnterEvent = (e: keyboardKey) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  }

  return (
    <div className="ChatAreaBG">
      <div className="ChatBubbleArea">
        {
          focusRoom === -1
            ?
            <SpeechBubble key="-42" nickName="Norminette" isMe={false}
              text={defaultText}
            />
            :
            roomList[focusRoom]?.detail?.messageList!.map((key) => (
              <SpeechBubble
                key={key.number}
                // nickName={userList[key.userId]?.userDisplayName}
                nickName={userList[key.userId].userDisplayName || key.userName}
                text={key.message}
                isMe={key.isMe}
              />
            ))
        }
      </div>
      <input type="text" className="ChatAreaInput" maxLength={256} value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => handleEnterEvent(e)}></input>
      <div className="ChatDMImg" onClick={handleSendMessage} />
    </div>
  );
}
