import "../../styles/ChatRoom.css";
import { useAtom } from "jotai";
import * as chatAtom from "../atom/ChatAtom";

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
  const [focusRoom] = useAtom(chatAtom.focusRoomAtom);

  return (
    <div className="ChatRoomObj" >
      {
        roomId === -42
          ? ''
          : <div className="ChatRoomIcon" />
      }
      {
        isJoin
          ? focusRoom === roomId
            ? <div className="ChatRoomJoin" style={{ color: "#73f" }} onClick={() => { callBack(roomId) }}>{roomName}</div>
            : <div className="ChatRoomJoin" onClick={() => { callBack(roomId) }}>{roomName}</div>
          : <div className="ChatRoomName" onClick={() => { callBack(roomId) }}>{roomName}</div>
      }
      {
        type === "protected"
          ? <div className="ChatRoomType" />
          : type === 'private'
            ? <div className="ChatRoomTypePrivate" />
            : null
      }
    </div>
  );
}
