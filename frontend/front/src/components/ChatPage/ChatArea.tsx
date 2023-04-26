import "../../styles/ChatArea.css";
import SpeechBubble from "../objects/SpeechBubble";
import * as chatAtom from '../atom/SocketAtom';
import type * as chatType from '../../socket/chatting.dto';
import { useAtom } from 'jotai';

export default function ChatArea() {
  const [focusRoom, setFocusRoom] = useAtom(chatAtom.focusRoomAtom);
  const [roomList, setRoomList] = useAtom(chatAtom.roomListAtom);

  return (
    <div className="ChatAreaBG">
      <div className="ChatBubbleArea">
        <SpeechBubble nickName="Me" text="text" isMe={true} />
        {
          focusRoom === -1 ? null :
            Object.entries(inRoomUserList).map((key) => (
              <UserObj
                key={Number(key[0])}
                nickName={userList[Number(key[0])].userDisplayName}
                profileImage={userList[Number(key[0])].userProfileUrl}
                status={userList[Number(key[0])].userStatus}
                power={inRoomUserList[Number(key[0])].userRoomPower}
                callBack={onClickInfo}
              />
            ))
        }
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
