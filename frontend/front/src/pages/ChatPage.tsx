import BackGround from "../components/BackGround";
import TopBar from "../components/TopBar";
import ChatRoomList from "../components/ChatPage/ChatRoomList";
import ChatUserList from "../components/ChatPage/ChatUserList";
import ChatArea from "../components/ChatPage/ChatArea";
import ChatRoomUserList from "../components/ChatPage/ChatRoomUserList";

import { useAtom } from "jotai";
import { userInfoModalAtom } from "../components/atom/ModalAtom";
import { inviteModalAtom } from "../components/atom/ModalAtom";
import { roomModalAtom } from "../components/atom/ModalAtom";

import UserInfoModal from "../components/ChatPage/UserInfoModal";
import RoomModal from "../components/ChatPage/RoomModal";
import RoomInviteModal from "../components/ChatPage/RoomInviteModal";
import { UserAtom } from "../components/atom/UserAtom";
import { useEffect, useState } from "react";

import * as socket from "../socket/socket";
import * as chatAtom from "../components/atom/SocketAtom";
import type * as chatType from "../socket/chatting.dto";

export default function ChatPage() {
  const [userInfoModal, setUserInfoModal] = useAtom(userInfoModalAtom);
  const [roomModal, setRoomModal] = useAtom(roomModalAtom);
  const [inviteModal, setInviteModal] = useAtom(inviteModalAtom);

  const [userInfo, setUserInfo] = useAtom(UserAtom);
  const [isFirstLogin, setIsFirstLogin] = useAtom(chatAtom.isFirstLoginAtom);

  const [roomList, setRoomList] = useAtom(chatAtom.roomListAtom);
  const [userList, setUserList] = useAtom(chatAtom.userListAtom);
  const [userBlockList, setUserBlockList] = useAtom(chatAtom.userBlockListAtom);
  const [dmHistoryList, setDmHistoryList] = useAtom(chatAtom.dmHistoryListAtom);
  const [followingList, setFollowingList] = useAtom(chatAtom.followingListAtom);
  const [focusRoom, setFocusRoom] = useAtom(chatAtom.focusRoomAtom);

  const getMyInfo = () => {
    fetch("http://localhost:4000/user/me", {
      credentials: "include",
      method: "GET",
    })
      .then((response) => response.json())
      .then((response) => {
        console.log(response);
        setUserInfo(response);
      }).catch((error) => {
        console.log(`error: ${error}`);
      });
  };

  const getRoomList = () => {
    console.log(`getRoomList ${JSON.stringify(roomList)}}`);
  }
  const getUserList = () => {
    console.log(`getUserList ${JSON.stringify(userList)}}`);
  }
  const getFollowingList = () => {
    console.log(`getFollowingList ${JSON.stringify(followingList)}}`);
  }

  if (isFirstLogin) {
    getMyInfo();
    socket.OnSocketChatEvent();
    socket.emitFollowingList({ setFollowingList });
    // init data request
    // socket.emitUserBlockList();
    // socket.emitDmHistoryList();
    // socket.emitRoomList();
    setIsFirstLogin(false);
  }

  return (
    <BackGround>
      <button onClick={getMyInfo}> /user/me</button>
      <button onClick={getRoomList}> roomList</button>
      <button onClick={getUserList}> userList</button>
      <button onClick={getFollowingList}> FollowList</button>
      <TopBar />
      {userInfoModal ? <UserInfoModal /> : null}
      {roomModal ? <RoomModal /> : null}
      {inviteModal ? <RoomInviteModal /> : null}
      <ChatRoomList />
      <ChatUserList />
      <ChatArea />
      <ChatRoomUserList />
    </BackGround >
  );
}
