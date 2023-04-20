import "../../styles/SpeechBubble.css";

export default function SpeechBubble({
  nickName,
  text,
  isMe,
}: {
  nickName: string;
  text: string;
  isMe: boolean;
}) {
  return (
    <div className="SpeechBubble">
      {isMe ? (
        <div className="SpeechBubbleMyNickName">{nickName}</div>
      ) : (
        <div className="SpeechBubbleNickName">{nickName}</div>
      )}
      {isMe ? (
        <div className="SpeechBubbleMyMessage">{text}</div>
      ) : (
        <div className="SpeechBubbleMessage">{text}</div>
      )}
    </div>
  );
}
