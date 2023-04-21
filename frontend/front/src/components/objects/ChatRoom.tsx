import "../../styles/ChatRoom.css";

export default function ChatRoom({ roomName, type }: { roomName: string; type: string }) {
  return (
    <div className="ChatRoomObj">
      <div className="ChatRoomIcon" />
      <div className="ChatRoomName">{roomName}</div>
      {type === "Protected" ? <div className="ChatRoomType" /> : null}
    </div>
  );
}
