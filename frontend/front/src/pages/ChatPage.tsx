import BackGround from "../components/BackGround";
import TopBar from "../components/TopBar";
import ChatRoomList from "../components/ChatPage/ChatRoomList";
import ChatUserList from "../components/ChatPage/ChatUserList";
import ChatArea from "../components/ChatPage/ChatArea";
import ChatRoomUserList from "../components/ChatPage/ChatRoomUserList";

import { useAtom } from "jotai";
import { userInfoModalAtom, passwordInputModalAtom, roomModalAtom, inviteModalAtom } from "../components/atom/ModalAtom";

import UserInfoModal from "../components/ChatPage/UserInfoModal";
import RoomModal from "../components/ChatPage/RoomModal";
import RoomInviteModal from "../components/ChatPage/RoomInviteModal";
import PasswordModal from "../components/ChatPage/PasswordModal";

import { UserAtom } from "../components/atom/UserAtom";
import type * as userType from "../components/atom/UserAtom";
import { useEffect, useState } from "react";

import * as socket from "../socket/chat.socket";
import * as chatAtom from "../components/atom/ChatAtom";
import type * as chatType from "../socket/chat.dto";
import { GetMyInfo } from '../event/api.request';

export default function ChatPage() {
  const [userInfoModal, setUserInfoModal] = useAtom(userInfoModalAtom);
  const [roomModal, setRoomModal] = useAtom(roomModalAtom);
  const [inviteModal, setInviteModal] = useAtom(inviteModalAtom);
  const [pwInputModal, setPwInputModal] = useAtom(passwordInputModalAtom);

  const [userInfo, setUserInfo] = useAtom(UserAtom);
  const [isFirstLogin, setIsFirstLogin] = useAtom(chatAtom.isFirstLoginAtom);

  const [roomList, setRoomList] = useAtom(chatAtom.roomListAtom);
  const [userList, setUserList] = useAtom(chatAtom.userListAtom);
  const [userHistory, setUserHistory] = useAtom(chatAtom.userHistoryAtom);
  const [userBlockList, setUserBlockList] = useAtom(chatAtom.userBlockListAtom);
  const [dmHistoryList, setDmHistoryList] = useAtom(chatAtom.dmHistoryListAtom);
  const [followingList, setFollowingList] = useAtom(chatAtom.followingListAtom);
  const [focusRoom, setFocusRoom] = useAtom(chatAtom.focusRoomAtom);

  const getRoomList = () => {
    console.log("\n\ngetRoomList");
    Object.entries(roomList).forEach(([key, value]) => {
      if (value.detail !== undefined) {
        console.log(`[ ${value.roomName} ] - ${value.roomType}`);
        Object.entries(value.detail).forEach(([key, value]) => {
          if (key === "userList") {
            Object.entries(value).forEach(([key, value]) => {
              console.log(`uid: ${key}, value: ${JSON.stringify(value)}`);
            });
          } else {
            console.log(`key: ${key}, value: ${JSON.stringify(value)}`);
          }
        });
      } else {
        console.log(`[ ${value.roomName} ] \nvalue: ${JSON.stringify(value)}`);
      }
    })
  };
  const getUserList = () => {
    console.log("\n\ngetUserList");
    Object.entries(userList).forEach(([key, value]) => {
      console.log(`[ ${value.userDisplayName} ]\nkey: ${key}, value: ${JSON.stringify(value)}`);
    })
  };
  const getFollowingList = () => {
    console.log(`getFollowingList ${JSON.stringify(followingList)}}`);
  };
  const emitTester = () => {
    socket.emitTest("hello")
  };
  const getMyinfo = () => {
    GetMyInfo({ setUserInfo });
  }
  const showMyinfo = () => {
    console.log(`showMyinfo ${JSON.stringify(userInfo)}}`);
  }
  const showServerUser = () => {
    console.log('\nshow server user list');
    socket.socket.emit('server-user-list');
  }
  const showServerRoom = () => {
    console.log('\nshow server room list');
    socket.socket.emit('server-room-list');
  }

  if (isFirstLogin) {
    console.log('set init data');
    GetMyInfo({ setUserInfo });
    // socket.OnSocketChatEvent();
    socket.emitUserBlockList({ userBlockList, setUserBlockList });
    socket.emitFollowingList({ userList, setUserList, followingList, setFollowingList });
    socket.emitDmHistoryList({ userList, setUserList, dmHistoryList, setDmHistoryList });
    socket.emitUserList({ userList, setUserList, userHistory, setUserHistory });
    socket.emitRoomList({ setRoomList });
    setIsFirstLogin(false);
  }

  useEffect(() => {
    socket.socket.on("room-list-notify", ({
      action,
      roomId,
      roomName,
      roomType,
    }: {
      action: 'add' | 'delete' | 'edit';
      roomId: number;
      roomName: string;
      roomType: 'open' | 'protected' | 'private';
    }) => {
      switch (action) {
        case 'add': {
          const newRoomList: chatType.roomListDto = {};
          newRoomList[roomId] = {
            roomName,
            roomType,
            isJoined: false,
          };
          console.log(`room-list-notify new: ${JSON.stringify(newRoomList)}`);
          console.log(`room-list-notify origin: ${JSON.stringify(roomList)}`);

          setRoomList({ ...roomList, ...newRoomList });
          break;
        }
        case 'delete': {
          const newRoomList: chatType.roomListDto = { ...roomList };
          delete newRoomList[roomId];
          setRoomList({ ...newRoomList });
          if (focusRoom === roomId) {
            setFocusRoom(-1);
          }
          break;
        }
        case 'edit': {
          const newRoomList: chatType.roomListDto = {};
          newRoomList[roomId] = {
            roomName,
            roomType,
            isJoined: roomList[roomId].isJoined || false,
            detail: roomList[roomId].detail || {} as chatType.roomDetailDto,
          };
          setRoomList({ ...roomList, ...newRoomList });
          break;
        }
      }
    });
    return () => {
      socket.socket.off("room-list-notify");
    };
  }, [roomList]);

  useEffect(() => {
    socket.socket.on("room-clear", () => {
      const cleanRoomList: chatType.roomListDto = {};
      setRoomList({ ...cleanRoomList });
      setFocusRoom(-1);
      socket.emitRoomList({ setRoomList });
    });
    return () => {
      socket.socket.off("room-clear");
    };
  }, []);

  useEffect(() => {
    socket.socket.on("user-clear", () => {
      const cleanUserList: chatType.userDto = {};
      setUserList({ ...cleanUserList });
      socket.emitUserList({ userList, setUserList, userHistory, setUserHistory });
    });
    return () => {
      socket.socket.off("room-clear");
    };
  }, []);

  useEffect(() => {
    socket.socket.on("room-join", ({
      roomId,
      roomName,
      roomType,
      userList = {},
      myPower,
      status
    }: {
      roomId: number,
      roomName: string,
      roomType: 'open' | 'protected' | 'private',
      userList: chatType.userInRoomListDto,
      myPower: 'owner' | 'admin' | 'member',
      status: 'ok' | 'ko'
    }) => {
      switch (status) {
        case 'ok': {
          const newRoomList: chatType.roomListDto = {};
          newRoomList[roomId] = {
            roomName,
            roomType,
            isJoined: true,
            detail: {
              userList: { ...userList },
              messageList: [],
              myRoomStatus: 'normal',
              myRoomPower: myPower
            }
          };
          setRoomList({ ...roomList, ...newRoomList });
          setFocusRoom(roomId);
          break;
        }
        case 'ko': {
          if (roomList[roomId].isJoined === false) {
            alert(`fail to join [${roomName}] room`);
          }
          break;
        }
      }
    });
    return () => {
      socket.socket.off("room-join");
    };
  }, [roomList]);

  useEffect(() => {
    socket.socket.on("room-in-action", ({
      roomId,
      action,
      targetId
    }: {
      roomId: number;
      action: 'ban' | 'kick' | 'mute' | 'admin' | 'normal' | 'owner' | 'leave' | 'newMember';
      targetId: number
    }) => {
      switch (action) {
        case 'newMember': {
          if (targetId === userInfo.uid) {
            return;
          } else {
            const newUserList: chatType.userInRoomListDto = roomList[roomId].detail?.userList!;
            const newUser: chatType.userInRoomListDto = {};
            newUser[targetId] = {
              userRoomStatus: 'normal',
              userRoomPower: 'member'
            };
            const newDetail: Partial<chatType.roomDetailDto> = { ...roomList[roomId].detail, userList: { ...newUserList, ...newUser } };
            const newRoomList: chatType.roomListDto = { ...roomList[roomId], ...newDetail };
            setRoomList({ ...roomList, ...newRoomList });
          }
          break;
        }
        case 'ban':
        case 'leave':
        case 'kick': {
          if (targetId !== userInfo.uid) {
            const newUserList: chatType.userInRoomListDto = roomList[roomId].detail?.userList!;
            delete newUserList[targetId];
            const newDetail: Partial<chatType.roomDetailDto> = { ...roomList[roomId].detail, userList: { ...newUserList } };
            const newRoomList: chatType.roomListDto = { ...roomList[roomId], ...newDetail };
            setRoomList({ ...roomList, ...newRoomList });
          }
          break;
        }
        case 'mute':
        case 'normal': {
          if (targetId === userInfo.uid) {
            const newDetail: Partial<chatType.roomDetailDto> = { ...roomList[roomId].detail, myRoomStatus: action };
            const newRoomList: chatType.roomListDto = { ...roomList[roomId], ...newDetail };
            setRoomList({ ...roomList, ...newRoomList });
          } else {
            const newUserList: chatType.userInRoomListDto = roomList[roomId].detail?.userList!;
            newUserList[targetId] = { ...newUserList[targetId], userRoomStatus: action };
            const newDetail: Partial<chatType.roomDetailDto> = { ...roomList[roomId].detail, userList: { ...newUserList } };
            const newRoomList: chatType.roomListDto = { ...roomList[roomId], ...newDetail };
            setRoomList({ ...roomList, ...newRoomList });
          }
          break;
        }
        case 'owner':
        case 'admin': {
          if (targetId === userInfo.uid) {
            const newDetail: Partial<chatType.roomDetailDto> = { ...roomList[roomId].detail, myRoomPower: action };
            const newRoomList: chatType.roomListDto = { ...roomList[roomId], ...newDetail };
            setRoomList({ ...roomList, ...newRoomList });
          } else {
            const newUserList: chatType.userInRoomListDto = roomList[roomId].detail?.userList!;
            newUserList[targetId] = { ...newUserList[targetId], userRoomPower: action };
            const newDetail: Partial<chatType.roomDetailDto> = { ...roomList[roomId].detail, userList: { ...newUserList } };
            const newRoomList: chatType.roomListDto = { ...roomList[roomId], ...newDetail };
            setRoomList({ ...roomList, ...newRoomList });
          }
          break;
        }
      }
    });
    return () => {
      socket.socket.off("room-in-action");
    }
  }, [roomList, userInfo]);

  useEffect(() => {
    socket.socket.on("user-update", ({
      userId,
      userDisplayName,
      userProfileUrl,
      userStatus
    }: {
      userId: number,
      userDisplayName: string
      userProfileUrl: string;
      userStatus: 'online' | 'offline' | 'inGame';
    }) => {
      if (userId !== userInfo.uid) {
        console.log(`user-upadate: user ${userId} is ${userStatus}`);
        const newUser: chatType.userDto = {};
        newUser[userId] = {
          userDisplayName,
          userProfileUrl,
          userStatus,
        };
        setUserList({ ...userList, ...newUser });
      } else {
        const newUser: chatType.userDto = {};
        newUser[userId] = {
          userDisplayName,
          userProfileUrl,
          userStatus: 'online',
        };
        setUserList({ ...userList, ...newUser });
      }
      setUserHistory({ ...userHistory, ...userList });
    });
    return () => {
      socket.socket.off("user-update");
    }
  }, [userList, userInfo]);

  useEffect(() => {
    socket.socket.on("message", ({
      roomId,
      from,
      message
    }: {
      roomId: number,
      from: number,
      message: string
    }) => {
      const block = userBlockList[from] ? true : false;
      switch (block) {
        case true: {
          console.log(`message from ${from} is blocked`);
          break;
        }
        case false: {
          console.log(`message from ${from} is received: ${message}`);
          const newMessageList: chatType.roomMessageDto[] = roomList[roomId].detail?.messageList!;
          newMessageList.unshift({
            userId: from,
            userName: userList[from].userDisplayName,
            message,
            isMe: userInfo.uid === from ? true : false,
            number: roomList[roomId].detail?.messageList.length!
          });
          const newDetail: Partial<chatType.roomDetailDto> = { ...roomList[roomId].detail, messageList: [...newMessageList] };
          const newRoomList: chatType.roomListDto = {};
          newRoomList[roomId] = {
            roomName: roomList[roomId].roomName,
            roomType: roomList[roomId].roomType,
            isJoined: roomList[roomId].isJoined,
            detail: newDetail as chatType.roomDetailDto
          };
          setRoomList({ ...roomList, ...newRoomList });
          break;
        }
      }
    });
    return () => {
      socket.socket.off("message");
    };
  }, [roomList, userBlockList, userList, userInfo]);

  return (
    <BackGround>
      <button onClick={getMyinfo}> /user/me</button>
      <button onClick={showMyinfo}> show /user/me</button>
      <button onClick={getRoomList}> roomList</button>
      <button onClick={getUserList}> userList</button>
      <button onClick={getFollowingList}> FollowList</button>
      <button onClick={emitTester}> emitTest</button>
      <button onClick={showServerUser}> show server user</button>
      <button onClick={showServerRoom}> show server room</button>
      <TopBar />
      {userInfoModal ? <UserInfoModal /> : null}
      {roomModal ? <RoomModal /> : null}
      {inviteModal ? <RoomInviteModal /> : null}
      {pwInputModal ? <PasswordModal /> : null}
      <ChatRoomList />
      <ChatUserList />
      <ChatArea />
      <ChatRoomUserList />
    </BackGround >
  );
}
