import "../../styles/ChatRoom.css";

export default function ChatRoom({
  roomId,
  roomName,
  type,
  isJoin,
  callBack,
}: {
  roomId: number;
  roomName: string;
  type: string;
  isJoin: boolean;
  callBack: (roomId: number) => void;
}) {

  return (
    <div className="ChatRoomObj" >
      <div className="ChatRoomIcon" />
      {
        isJoin
          ? <div className="ChatRoomJoin" onClick={() => { callBack(roomId) }}>{roomName}</div>
          : <div className="ChatRoomName" onClick={() => { callBack(roomId) }}>{roomName}</div>
      }
      {type === "protected" ? <div className="ChatRoomType" /> : null}
    </div>
  );
}
