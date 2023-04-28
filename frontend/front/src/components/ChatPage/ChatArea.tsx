import "../../styles/ChatArea.css";
import SpeechBubble from "../objects/SpeechBubble";
import * as chatAtom from '../atom/ChatAtom';
import { useAtom } from 'jotai';

export default function ChatArea() {
  const [focusRoom,] = useAtom(chatAtom.focusRoomAtom);
  const [roomList,] = useAtom(chatAtom.roomListAtom);
  const [userList,] = useAtom(chatAtom.userListAtom);


  return (
    <div className="ChatAreaBG">
      <div className="ChatBubbleArea">
        {
          focusRoom === -1 ? null :
            roomList[focusRoom]?.detail?.messageList!.map((key) => (
              <SpeechBubble
                key={key.number}
                nickName={userList[key.userId].userDisplayName}
                text={key.message}
                isMe={key.isMe}
              />
            ))
        }
        <SpeechBubble nickName="Me" text="text" isMe={true} />
        <SpeechBubble
          nickName="Other"
          text="texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext"
          isMe={false}
        />
        <SpeechBubble
          nickName="Me"
          text="texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext"
          isMe={true}
        />
        <SpeechBubble nickName="Other" text="text" isMe={false} />
      </div>
      <input type="text" className="ChatAreaInput"></input>
      <div className="ChatDMImg" />
    </div>
  );
}
