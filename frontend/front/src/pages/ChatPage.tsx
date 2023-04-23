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

import { socket } from "../socket/socket";
import { useEffect, useState } from 'react';
import { chatInfoAtom, focusRoomAtom } from '../components/atom/SocketAtom';

export default function ChatPage() {
  const [userInfoModal, setUserInfoModal] = useAtom(userInfoModalAtom);
  const [roomModal, setRoomModal] = useAtom(roomModalAtom);
  const [inviteModal, setInviteModal] = useAtom(inviteModalAtom);
  const [chatInfo, setChatInfo] = useAtom(chatInfoAtom);

  useEffect(() => {
    socket.on("init", (data) => {
      console.log("init event : established connection with server, ", data);
    });

    socket.on("message", ({ roomName, from, message }) => {
      const findRoom = chatInfo.joinRoomList.find((room) => room.roomDefaultInfo.roomName === roomName);
      if (findRoom === undefined) {
      } else {
        const newMessageList = [...findRoom.roomMessageList, { userName: from, message: message, isMe: false }];
        const exceptMessageList = {
          roomDefaultInfo: findRoom.roomDefaultInfo,
          roomUserList: findRoom.roomUserList,
          myRoomStatus: findRoom.myRoomStatus,
        };
        const newRoomAttributes = { ...exceptMessageList, roomMessageList: newMessageList };
        const exceptJoinRoomList = {
          userList: chatInfo.userList,
          roomList: chatInfo.roomList,
        }
        const exceptSpecificRoomList = chatInfo.joinRoomList.filter((room) => room.roomDefaultInfo.roomName !== roomName);
        const newJoinRoomList = { ...exceptSpecificRoomList, newRoomAttributes };
        setChatInfo({ ...exceptJoinRoomList, newJoinRoomList });
      }
    });

    socket.on("delete-room", (deletedRoom) => {
    });

    socket.on("create-room", (newRoomName) => {
    });

    return () => {
    };

  }, [chatInfo]);

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
