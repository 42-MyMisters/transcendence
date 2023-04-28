import "../../styles/ChatRoom.css";

export default function ChatRoom({ roomName, type, isJoin }: { roomName: string; type: string, isJoin: boolean }) {
  return (
    <div className="ChatRoomObj" >
      <div className="ChatRoomIcon" />
      {
        isJoin ?
          <div className="ChatRoomJoin" >{roomName}</div>
          : <div className="ChatRoomName">{roomName}</div>
      }
      {type === "protected" ? <div className="ChatRoomType" /> : null}
    </div>
  );
}
