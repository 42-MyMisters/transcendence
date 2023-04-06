import "../../styles/ChatArea.css";

export default function ChatArea() {
  return (
    <div className="ChatAreaBG">
      <div className="ChatBubbleArea">
        <div>Chat1</div>
        <div>Chat2</div>
      </div>
      <input type="text" className="ChatAreaInput"></input>
      <div className="ChatDMImg" />
    </div>
  );
}
