import "../../styles/ChatArea.css";
import SpeechBubble from "../objects/SpeechBubble";

export default function ChatArea() {
  return (
    <div className="ChatAreaBG">
      <div className="ChatBubbleArea">
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
