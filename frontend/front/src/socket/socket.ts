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
    action: 'add' | 'delete';
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
          isJoined: roomList[roomId] ? true : false,
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
    }
  });

  socket.on("room-join", ({
    roomId,
    roomName,
    roomType,
    userList = {}
  }: {
    roomId: number,
    roomName: string,
    roomType: 'open' | 'protected' | 'private',
    userList: chatType.userInRoomListDto,
  }) => {
    const newRoomList: chatType.roomListDto = {};
    newRoomList[roomId] = {
      roomName,
      roomType: roomType,
      isJoined: true,
      detail: {
        userList: { ...userList },
        messageList: [],
        myRoomStatus: 'normal',
        myRoomPower: 'member'
      }
    };
    setRoomList({ ...roomList, ...newRoomList });
    setFocusRoom(roomId);
  });

  socket.on("room-inaction", ({
    roomId,
    action
  }: {
    roomId: number;
    action: 'ban' | 'kick' | 'mute' | 'admit-admin'
  }) => {
    switch (action) {
      case 'ban': {
        emitRoomLeave({ roomList, setRoomList, focusRoom, setFocusRoom }, roomId, true);
        break;
      }
      case 'kick': {
        emitRoomLeave({ roomList, setRoomList, focusRoom, setFocusRoom }, roomId)
        break;
      }
      case 'mute': {
        const tempRoomList: chatType.roomListDto = { ...roomList[roomId] };
        const newDetail: Partial<chatType.roomDetailDto> = { ...tempRoomList[roomId].detail, myRoomStatus: 'mute' };
        const newRoomList: chatType.roomListDto = { ...tempRoomList[roomId], ...newDetail };
        setRoomList({ ...roomList, ...newRoomList });
        break;
      }
      case 'admit-admin': {
        const tempRoomList: chatType.roomListDto = { ...roomList[roomId] };
        const newDetail: Partial<chatType.roomDetailDto> = { ...tempRoomList[roomId].detail, myRoomPower: 'admin' };
        const newRoomList: chatType.roomListDto = { ...tempRoomList[roomId], ...newDetail };
        setRoomList({ ...roomList, ...newRoomList });
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
      hasDmHistory: dmHistoryList[userId] ? true : false,
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
        const newMessage: chatType.roomMessageDto = {
          userId: from,
          message,
          isMe: false
        };
        const tempRoomList: chatType.roomListDto = { ...roomList[roomId] };
        const newMessageList: chatType.roomMessageDto[] = tempRoomList[roomId].detail?.messageList || [];
        newMessageList.push(newMessage);
        const newDetail: Partial<chatType.roomDetailDto> = { ...tempRoomList[roomId].detail, messageList: [...newMessageList] };
        const newRoomList: chatType.roomListDto = { ...tempRoomList, ...newDetail };
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
    setRoomList({ ...roomList });
  });
}

export function emitRoomCreate(
  {
    roomList,
    setRoomList
  }: {
    roomList: chatType.roomListDto,
    setRoomList: React.Dispatch<React.SetStateAction<chatType.roomListDto>>,
  },
  roomName: string,
  roomCheck: boolean = false,
  roomPass: string = ''
) {
  console.log("emitRoomCreate", `roomName: ${roomName}, roomType: ${roomCheck}, roomPass: ${roomPass}`);
  const roomType = roomCheck ? 'private' : roomPass ? 'protected' : 'open';
  socket.emit("room-create", {
    roomName,
    roomType,
    roomPass,
  }, ({
    status,
    payload,
  }: {
    status: boolean,
    payload: string | number,
  }) => {
    switch (status) {
      case true: {
        console.log("room-create success");
        const newRoomList: chatType.roomListDto = {};
        newRoomList[payload as number] = {
          roomName: roomName,
          roomType: roomType,
          isJoined: true,
        }
        setRoomList({ ...roomList, ...newRoomList });
        break;
      }
      case false: {
        console.log("room-create fail");
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
  }, ({
    status,
    reason,
    userList,
  }: {
    status: 'ok' | 'ko',
    reason?: string,
    userList?: chatType.userInRoomListDto,
  }) => {
    switch (status) {
      case 'ok': {
        console.log(`room-join success: ${roomList[roomId].roomName}`);
        const newRoomList: chatType.roomListDto = {};
        newRoomList[roomId] = {
          roomName: roomList[roomId].roomName,
          roomType: roomList[roomId].roomType,
          isJoined: true,
          detail: {
            userList: { ...userList },
            messageList: [],
            myRoomStatus: 'normal',
            myRoomPower: 'member'
          }
        };
        setRoomList({ ...roomList, ...newRoomList });
        setFocusRoom(roomId);
        break;
      }
      case 'ko': {
        break;
      }
    }
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
  }, (status: 'leave' | 'delete') => {
    switch (status) {
      case 'leave': {
        const roomName = roomList[roomId].roomName;
        console.log(`room ${roomId}:${roomName} is leaved`);
        const newRoomList: chatType.roomListDto = { ...roomList[roomId] };
        newRoomList[roomId].isJoined = false;
        newRoomList[roomId].detail = undefined;
        setRoomList({ ...roomList, ...newRoomList });
        if (focusRoom === roomId) {
          setFocusRoom(-1);
        }
        break;
      }
      case 'delete': {
        console.log(`room ${roomId}:${roomList[roomId].roomName} is deleted`);
        const newRoomList: chatType.roomListDto = { ...roomList };
        delete newRoomList[roomId];
        setRoomList({ ...newRoomList });
        break;
      }
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
  action: 'ban' | 'kick' | 'mute' | 'admit-admin',
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
        console.log(`room-inaction in ${roomId} to ${targetId} with ${action} OK`);
        switch (action) {
          case 'mute': {
            const tempRoomList: chatType.roomListDto = { ...roomList[roomId] };
            const newDetail: Partial<chatType.roomDetailDto> = { ...tempRoomList[roomId].detail };
            const newUserList: chatType.userInRoomListDto = { ...newDetail.userList };
            newUserList[targetId].userRoomStatus = 'mute';
            newDetail.userList = { ...newUserList };
            const newRoomList: chatType.roomListDto = { ...tempRoomList[roomId], ...newDetail };
            setRoomList({ ...roomList, ...newRoomList });
            break;
          }
          case 'admit-admin': {
            const tempRoomList: chatType.roomListDto = { ...roomList[roomId] };
            const newDetail: Partial<chatType.roomDetailDto> = { ...tempRoomList[roomId].detail };
            const newUserList: chatType.userInRoomListDto = { ...newDetail.userList };
            newUserList[targetId].userRoomPower = 'admin';
            newDetail.userList = { ...newUserList };
            const newRoomList: chatType.roomListDto = { ...tempRoomList[roomId], ...newDetail };
            setRoomList({ ...roomList, ...newRoomList });
            break;
          }
        }
        break;
      }
      case 'ko': {
        console.log(`room-inaction in ${roomId} to ${targetId} with ${action} failed: ${payload}`);
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
        console.log(`user-block failed: ${payload}`);
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
        console.log(`user-invite ${userList[targetId].userDisplayName} failed: ${payload}`);
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

export function emitFollowingList() {
  //TODO: NOTE: API
  // const userId = 1;

  // socket.emit("following-list", {
  // 	userId
  // }, ({
  // 	userList,
  // }: {
  // 	userList: chatType.userDto,
  // }) => {

  // });
}

export function emitMessage(
  {
    userInfo,
    roomList,
    setRoomList
  }: {
    userInfo: userAtom.userType,
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
        console.log(`message to ${roomList[roomId].roomName} is sended: ${message}`);
        const newMessage: chatType.roomMessageDto = {
          userId: userInfo.uid,
          message,
          isMe: true
        };
        const tempRoomList: chatType.roomListDto = { ...roomList[roomId] };
        const newMessageList: chatType.roomMessageDto[] = tempRoomList[roomId].detail?.messageList || [];
        newMessageList.push(newMessage);
        const newDetail: Partial<chatType.roomDetailDto> = { ...tempRoomList[roomId].detail, messageList: [...newMessageList] };
        const newRoomList: chatType.roomListDto = { ...tempRoomList, ...newDetail };
        setRoomList({ ...roomList, ...newRoomList });
        break;
      }
      case 'ko': {
        console.log(`message to ${to} is failed: ${payload}`);
        break;
      }
    }
  });
}
