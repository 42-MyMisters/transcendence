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

import { useEffect, useState } from 'react';
import { socket } from "../socket/socket";
import * as chatAtom from '../components/atom/SocketAtom';

export default function ChatPage() {
  const [userInfoModal, setUserInfoModal] = useAtom(userInfoModalAtom);
  const [roomModal, setRoomModal] = useAtom(roomModalAtom);
  const [inviteModal, setInviteModal] = useAtom(inviteModalAtom);

  const [userList, setUserList] = useAtom(chatAtom.userListAtom);
  const [roomList, setRoomList] = useAtom(chatAtom.roomListAtom);
  const [joinRoomList, setJoinRoomList] = useAtom(chatAtom.joinRoomListAtom);
  const [focusRoom, setFocusRoom] = useAtom(chatAtom.focusRoomAtom);
  const [isFirstLogin, setIsFirstLogin] = useAtom(chatAtom.isFirstLoginAtom);

  socket.on("init", (data) => {
    console.log("init event : established connection with server, ", data);
  });

  socket.on("change-UserInfo", ({ roomName, from, message }) => { });
  socket.on("change-UserRoomInfo", ({ roomName, from, message }) => { });

  socket.on("join-newuser", ({ roomName, from, message }) => { });

  socket.on("message", ({ roomName, from, message }) => {
    const findRoom = joinRoomList.find((room) => room.info.roomName === roomName);
    if (findRoom === undefined) {
      // not join room
    } else {
      const otherRoom = joinRoomList.filter((room) => room.info.roomName !== roomName);
      // new user check before
      otherRoom.push({
        info: findRoom.info,
        userList: findRoom.userList,
        messageList: [...findRoom.messageList, { from, message, isMe: false }],
        userNameHistory: findRoom.userNameHistory
      });
      setJoinRoomList(otherRoom);
    }
  });

  socket.on("delete-room", (deletedRoom) => {
  });

  socket.on("create-room", (newRoomName) => {
  });

  if (isFirstLogin) { // socket init info stage
    socket.emit('room-list', (ack) => {

    });

    setIsFirstLogin(false);
  }

  return (
    <BackGround>
      <TopBar />
      {userInfoModal ? <UserInfoModal /> : null}
      {roomModal ? <RoomModal /> : null}
      {inviteModal ? <RoomInviteModal /> : null}
      <ChatRoomList />
      <ChatUserList />
      <ChatArea />
      <ChatRoomUserList />
    </BackGround>
  );
}
