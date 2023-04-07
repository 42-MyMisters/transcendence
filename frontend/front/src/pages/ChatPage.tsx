// import Navigator from "../components/Navigator";

// export default function ChatPage() {
//   return (
//     <>
//       <Navigator />
//       <div>채팅페이지</div>
//     </>
//   );
// }

import BackGround from "../components/BackGround";
import TopBar from "../components/TopBar";
import ChatRoomList from "../components/ChatPage/ChatRoomList";
import ChatUserList from "../components/ChatPage/ChatUserList";
import ChatArea from "../components/ChatPage/ChatArea";
import ChatRoomUserList from "../components/ChatPage/ChatRoomUserList";
import { useState } from "react";
import UserInfoModal from "../components/ChatPage/UserInfoModal";
import RoomModal from "../components/ChatPage/RoomModal";
import RoomInviteModal from "../components/ChatPage/RoomInviteModal";

export default function ChatPage() {
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  return (
    <BackGround>
      <TopBar />
      {showUserInfoModal ? <UserInfoModal setUserInfoModal={setShowUserInfoModal} /> : null}
      {showRoomModal ? <RoomModal setRoomModal={setShowRoomModal} /> : null}
      {showInviteModal ? <RoomInviteModal setInviteModal={setShowInviteModal} /> : null}
      <ChatRoomList setRoomModal={setShowRoomModal} />
      <ChatUserList />
      <ChatArea />
      <ChatRoomUserList
        setUserInfoModal={setShowUserInfoModal}
        setInviteModal={setShowInviteModal}
      />
    </BackGround>
  );
}
