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

export default function ChatPage() {
  return (
    <BackGround>
      <TopBar />
      <ChatRoomList />
      <ChatUserList />
      <ChatArea />
      <ChatRoomUserList />
    </BackGround>
  );
}
