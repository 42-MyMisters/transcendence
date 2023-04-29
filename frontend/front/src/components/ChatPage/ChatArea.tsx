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

  const handleSendMessage = () => {
    const tempMessage = message.trim();
    if (tempMessage !== '') {
      socket.emitMessage({ userInfo, roomList, setRoomList }, focusRoom, tempMessage);
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
          focusRoom === -1 ? null :
            roomList[focusRoom]?.detail?.messageList!.map((key) => (
              <SpeechBubble
                key={key.number}
                nickName={userList[key.userId]?.userDisplayName}
                text={key.message}
                isMe={key.isMe}
              />
            ))
        }
        <SpeechBubble key="-1111" nickName="Me" text="text" isMe={true} />
        <SpeechBubble
          key="-111"
          nickName="Other"
          text="texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext"
          isMe={false}
        />
        <SpeechBubble
          key="-11"
          nickName="Me"
          text="texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext"
          isMe={true}
        />
        <SpeechBubble key="-1" nickName="Other" text="text" isMe={false} />
      </div>
      <input type="text" className="ChatAreaInput" maxLength={256} value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => handleEnterEvent(e)}></input>
      <div className="ChatDMImg" onClick={handleSendMessage} />
    </div>
  );
}
