import { io } from 'socket.io-client';
import { useAtom } from "jotai";
import * as chatAtom from '../components/atom/SocketAtom';
import * as userAtom from '../components/atom/UserAtom';
import type * as chatType from '../socket/chatting.dto';

const URL = "http://localhost:4000";
const NameSpace = "/sock";

export const socket = io(`${URL}${NameSpace}`, {
  auth: (cb) => {
    cb({ token: localStorage.getItem("refreshToken") });
  },
  autoConnect: false,
  transports: ["websocket"],
  // reconnectionDelay: 1000, // defaults to 1000
  // reconnectionDelayMax: 10000, // defaults to 5000
  // withCredentials: true,
  // path: "/socket.io",
});

export function OnSocketCoreEvent() {

  // catch all incoming events
  socket.onAny((eventName, ...args) => {
    console.log("incoming ", eventName, args);
  });

  // catch all outgoing events
  socket.prependAny((eventName, ...args) => {
    console.log("outgoing ", eventName, args);
  });

  socket.on("connect", () => {
    if (socket.connected) {
      //This attribute describes whether the socket is currently connected to the server.
      if (socket.recovered) {
        // any missed packets will be received
      } else {
        // new or unrecoverable session
        console.log("socket connected : " + socket.id);
      }
    }
  });

  //https://socket.io/docs/v4/client-socket-instance/#disconnect
  socket.on("disconnect", (reason) => {
    /**
     *  BAD, will throw an error
     *  socket.emit("disconnect");
    */
    if (reason === "io server disconnect") {
      // the disconnection was initiated by the server, you need to reconnect manually
    }
    // else the socket will automatically try to reconnect
    console.log("socket disconnected");
  });

  // the connection is denied by the server in a middleware function
  socket.on("connect_error", (err) => {
    if (err.message === "unauthorized") {
      // handle each case
    }
    console.log(err.message); // prints the message associated with the error
  });
}

export function OnSocketChatEvent() {
  const [roomList, setRoomList] = useAtom(chatAtom.roomListAtom);
  const [userList, setUserList] = useAtom(chatAtom.userListAtom);
  const [userBlockList, setUserBlockList] = useAtom(chatAtom.userBlockListAtom);
  const [dmHistoryList, setDmHistoryList] = useAtom(chatAtom.dmHistoryListAtom);
  const [focusRoom, setFocusRoom] = useAtom(chatAtom.focusRoomAtom);
  const [userInfo, setUserInfo] = useAtom(userAtom.UserAtom);

  socket.on("room-list-notify", ({
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
        setRoomList({ ...roomList, ...newRoomList });
        break;
      }
      case 'delete': {
        const newRoomList: chatType.roomListDto = { ...roomList };
        delete newRoomList[roomId];
        setRoomList({ ...newRoomList });
        break;
      }
      case 'edit': {
        const newRoomList: chatType.roomListDto = {};
        newRoomList[roomId] = {
          roomName,
          roomType,
          isJoined: roomList[roomId].isJoined,
          detail: roomList[roomId].detail
        };
        setRoomList({ ...roomList, ...newRoomList });
        break;
      }
    }
  });

  socket.on("room-join", ({
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

  socket.on("room-inaction", ({
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
      case 'ban': {
        if (targetId === userInfo.uid) {
          emitRoomLeave({ roomList, setRoomList, focusRoom, setFocusRoom }, roomId, true);
        } else {
          const newUserList: chatType.userInRoomListDto = roomList[roomId].detail?.userList!;
          delete newUserList[targetId];
          const newDetail: Partial<chatType.roomDetailDto> = { ...roomList[roomId].detail, userList: { ...newUserList } };
          const newRoomList: chatType.roomListDto = { ...roomList[roomId], ...newDetail };
          setRoomList({ ...roomList, ...newRoomList });
        }
        break;
      }
      case 'leave': {
        if (targetId === userInfo.uid) {
          return;
        } else {
          const newUserList: chatType.userInRoomListDto = roomList[roomId].detail?.userList!;
          delete newUserList[targetId];
          const newDetail: Partial<chatType.roomDetailDto> = { ...roomList[roomId].detail, userList: { ...newUserList } };
          const newRoomList: chatType.roomListDto = { ...roomList[roomId], ...newDetail };
          setRoomList({ ...roomList, ...newRoomList });
        }
        break;
      }
      case 'kick': {
        if (targetId === userInfo.uid) {
          emitRoomLeave({ roomList, setRoomList, focusRoom, setFocusRoom }, roomId)
        } else {
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

  socket.on("user-update", ({
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
    const newUser: chatType.userDto = {};
    newUser[userId] = {
      userDisplayName,
      userProfileUrl,
      userStatus,
    };
    setUserList({ ...userList, ...newUser });
  });

  socket.on("message", ({
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
        newMessageList.push({
          userId: from,
          message,
          isMe: false,
          number: roomList[roomId].detail?.messageList.length!
        });
        const newDetail: Partial<chatType.roomDetailDto> = { ...roomList[roomId].detail, messageList: [...newMessageList] };
        const newRoomList: chatType.roomListDto = { ...roomList, ...newDetail };
        setRoomList({ ...roomList, ...newRoomList });
        break;
      }
    }
  });

}

export function emitRoomList(
  {
    setRoomList
  }: {
    setRoomList: React.Dispatch<React.SetStateAction<chatType.roomListDto>>,
  }
) {
  socket.emit("room-list", ({
    roomList
  }: {
    roomList: chatType.roomListDto;
  }) => {
    Object.entries(roomList).forEach(([key, value]) => {
      value.isJoined = false;
    });
    setRoomList({ ...roomList });
  });
}

export function emitRoomCreate(
  roomName: string,
  roomCheck: boolean = false,
  roomPass: string = ''
) {
  const roomType = roomCheck ? 'private' : roomPass ? 'protected' : 'open';
  socket.emit("room-create", {
    roomName,
    roomType,
    roomPass,
  }, ({
    status,
  }: {
    status: 'ok' | 'ko',
  }) => {
    switch (status) {
      case 'ok': {
        console.log("room-create success");
        break;
      }
      case 'ko': {
        console.log("room-create fail");
        alert(`${roomName} room-create fail`);
        break;
      }
    };
  });
}

export function emitRoomJoin(
  {
    roomList,
    setRoomList,
    focusRoom,
    setFocusRoom
  }: {
    roomList: chatType.roomListDto,
    setRoomList: React.Dispatch<React.SetStateAction<chatType.roomListDto>>,
    focusRoom: number,
    setFocusRoom: React.Dispatch<React.SetStateAction<number>>,
  },
  roomId: number,
  roomPass: string = ''
) {
  socket.emit("room-join", {
    roomId,
    roomPass,
  });
}

export function emitRoomLeave(
  {
    roomList,
    setRoomList,
    focusRoom,
    setFocusRoom
  }: {
    roomList: chatType.roomListDto,
    setRoomList: React.Dispatch<React.SetStateAction<chatType.roomListDto>>,
    focusRoom: number,
    setFocusRoom: React.Dispatch<React.SetStateAction<number>>,
  },
  roomId: number,
  ban: boolean = false
) {
  socket.emit("room-leave", {
    roomId, ban
  }, () => {
    const roomName = roomList[roomId].roomName;
    console.log(`room leaved: ${roomId}:${roomName} `);
    const newRoomList: chatType.roomListDto = { ...roomList[roomId] };
    newRoomList[roomId].isJoined = false;
    newRoomList[roomId].detail = undefined;
    setRoomList({ ...roomList, ...newRoomList });
    if (focusRoom === roomId) {
      setFocusRoom(-1);
    }
  });
}

export function emitRoomInAction(
  {
    roomList,
    setRoomList,
  }: {
    roomList: chatType.roomListDto,
    setRoomList: React.Dispatch<React.SetStateAction<chatType.roomListDto>>,
  },
  roomId: number,
  action: 'ban' | 'kick' | 'mute' | 'admin',
  targetId: number,
) {
  socket.emit("room-inaction", {
    roomId,
    action,
    targetId,
  }, ({
    status,
    payload,
  }: {
    status: 'ok' | 'ko',
    payload?: string,
  }) => {
    switch (status) {
      case 'ok': {
        console.log(`room - inaction in ${roomId} to ${targetId} with ${action} OK`);
        break;
      }
      case 'ko': {
        console.log(`room - inaction in ${roomId} to ${targetId} with ${action} failed: ${payload} `);
        alert(`Room in Action [${action}] is faild: ${payload}`);
        break;
      }
    }
  });
}

export function emitRoomPasswordEdit(
  {
    roomList,
    setRoomList,
  }: {
    roomList: chatType.roomListDto,
    setRoomList: React.Dispatch<React.SetStateAction<chatType.roomListDto>>,
  },
  roomId: number,
  password: string
) {
  socket.emit("room-password-edit", {
    roomId,
    password,
  }, ({
    status,
    payload,
  }: {
    status: 'ok' | 'ko',
    payload?: string,
  }) => {
    switch (status) {
      case 'ok': {
        console.log(`room password edit - OK`);
        break;
      }
      case 'ko': {
        console.log(`room password edit - KO`);
        alert(`Room Password Edit is faild: ${payload}`);
        break;
      }
    }
  });
}

export function emitUserBlock(
  {
    userBlockList,
    setUserBlockList,
  }: {
    userBlockList: chatType.userSimpleDto,
    setUserBlockList: React.Dispatch<React.SetStateAction<chatType.userSimpleDto>>,
  },
  targetId: number,
) {
  socket.emit("user-block", {
    targetId
  }, ({
    status,
    payload
  }: {
    status: 'on' | 'off' | 'ko',
    payload?: string,
  }) => {
    switch (status) {
      case 'on': {
        const newBlockUser: chatType.userSimpleDto = {};
        newBlockUser[targetId] = {
          blocked: true
        }
        setUserBlockList({ ...userBlockList, ...newBlockUser });
        break;
      }
      case 'off': {
        const newBlockList: chatType.userSimpleDto = { ...userBlockList };
        delete newBlockList[targetId];
        setUserBlockList({ ...newBlockList });
        break;
      }
      case 'ko': {
        console.log(`user - block failed: ${payload} `);
        alert(`block failed: ${payload}`);
        break;
      }
    }
  });
}

export function emitUserInvite(
  {
    userList,
  }: {
    userList: chatType.userDto,
  },
  targetId: number,
  roomId: number,
) {
  socket.emit("user-invite", {
    targetId,
    roomId
  }, ({
    status,
    payload,
  }: {
    status: 'ok' | 'ko',
    payload?: string,
  }) => {
    switch (status) {
      case 'ok': {
        break;
      }
      case 'ko': {
        console.log(`user - invite ${userList[targetId].userDisplayName} failed: ${payload} `);
        alert(`invite failed: ${payload}`);
        break;
      }
    }
  });
}

export function emitUserList(
  {
    setUserList
  }: {
    setUserList: React.Dispatch<React.SetStateAction<chatType.userDto>>,
  },
  userId: number,
) {
  socket.emit("user-list", {
    userId
  }, ({
    userList,
  }: {
    userList: chatType.userDto,
  }) => {
    setUserList({ ...userList })
  });
}

export function emitUserBlockList(
  {
    setUserBlockList
  }: {
    setUserBlockList: React.Dispatch<React.SetStateAction<chatType.userSimpleDto>>,
  },
  userId: number
) {
  socket.emit("user-block-list", {
    userId
  }, ({
    userList,
  }: {
    userList: chatType.userSimpleDto,
  }) => {
    setUserBlockList({ ...userList });
  });
}

export function emitDmHistoryList(
  {
    setDmHistoryList
  }: {
    setDmHistoryList: React.Dispatch<React.SetStateAction<chatType.userDto>>,
  },
  userId: number
) {
  socket.emit("dm-history-list", {
    userId
  }, ({
    userList,
  }: {
    userList: chatType.userDto,
  }) => {
    setDmHistoryList({ ...userList });
  });
}

export function emitFollowingList(
  {
    followingList,
    setFollowingList
  }: {
    followingList: chatType.userDto,
    setFollowingList: React.Dispatch<React.SetStateAction<chatType.userDto>>,
  }) {
  console.log('emit following list');
  fetch('http://localhost:4000/user/following', {
    credentials: "include",
    method: "GET",
  })
    .then((response) => response.json())
    .then((response) => {
      console.log(response);
      let tempFollowingList: chatType.userDto = {};
      response.map((
        user: {
          uid: number,
          nickname: string,
          profileUrl: string,
        }) => {
        if (followingList[user.uid] === undefined) {
          tempFollowingList[user.uid] = {
            userDisplayName: user.nickname,
            userProfileUrl: user.profileUrl,
            userStatus: 'offline'
          }
          setFollowingList({ ...followingList, ...tempFollowingList });
        }
        return undefined
      });
    })
    .catch((error) => {
    });
  return undefined
}

export function emitMessage(
  {
    userInfo,
    roomList,
    setRoomList
  }: {
    userInfo: userAtom.UserType,
    roomList: chatType.roomListDto,
    setRoomList: React.Dispatch<React.SetStateAction<chatType.roomListDto>>,
  },
  roomId: number,
  to: number,
  message: string,
) {

  socket.emit("message", {
    roomId,
    message
  }, ({
    status,
    payload,
  }: {
    status: 'ok' | 'ko',
    payload?: 'string'
  }) => {
    switch (status) {
      case 'ok': {
        console.log(`message to ${roomList[roomId].roomName} is sended: ${message} `);
        const newMessageList: chatType.roomMessageDto[] = roomList[roomId].detail?.messageList!;
        newMessageList.push({
          userId: userInfo.uid,
          message,
          isMe: true,
          number: roomList[roomId].detail?.messageList.length!
        });
        const newDetail: Partial<chatType.roomDetailDto> = { ...roomList[roomId].detail, messageList: [...newMessageList] };
        const newRoomList: chatType.roomListDto = { ...roomList, ...newDetail };
        setRoomList({ ...roomList, ...newRoomList });
        break;
      }
      case 'ko': {
        console.log(`message to ${to} is failed: ${payload} `);
        alert(`message failed: ${payload}`);
        break;
      }
    }
  });
}
