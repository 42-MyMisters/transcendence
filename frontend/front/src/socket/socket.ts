import { io } from 'socket.io-client';
import { useAtom } from "jotai";
import * as chatAtom from '../components/atom/SocketAtom';
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
      default: {
        // error case
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
        emitRoomLeave(roomId, { roomList, setRoomList, focusRoom, setFocusRoom }, true);
        break;
      }
      case 'kick': {
        emitRoomLeave(roomId, { roomList, setRoomList, focusRoom, setFocusRoom })
        break;
      }
      case 'mute': {
        break;
      }
      case 'admit-admin': {
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
        const newRoomList: chatType.roomListDto = { ...roomList[roomId] };
        const newMessageList: chatType.roomMessageDto[] = newRoomList[roomId].detail?.messageList || [];
        if (newMessageList !== undefined) {
          newMessageList.push({
            userId: from,
            message,
            isMe: false,
          });
          console.log(`message from ${from} is received`);
          setRoomList({ ...roomList, ...newRoomList });
        }
        break;
      }
    }
  });

}

export function emitRoomList() {
  socket.emit("room-list", ({
    roomList
  }: {
    roomList: chatType.roomListDto;
  }) => {

  });
}

export function emitRoomCreate({ roomName, roomCheck = false, roomPass = '' }: {
  roomName: string,
  roomCheck?: boolean
  roomPass?: string,
}, { roomList, setRoomList }: {
  roomList: chatType.roomListDto,
  setRoomList: React.Dispatch<React.SetStateAction<chatType.roomListDto>>,
}) {
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
        console.log("room create success");
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
        console.log("room create fail");
        break;
      }
    };
  });
}

export function emitRoomJoin(
  {
    focusRoom,
    setFocusRoom
  }: {
    focusRoom: number,
    setFocusRoom: React.Dispatch<React.SetStateAction<number>>,
  }) {
  const roomId = 1;
  const roomPass = "aoiresnt";

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
    userList?: chatType.userDto,
  }) => {
    switch (status) {
      case 'ok': {
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
  roomId: number,
  {
    roomList, setRoomList, focusRoom, setFocusRoom
  }: {
    roomList: chatType.roomListDto,
    setRoomList: React.Dispatch<React.SetStateAction<chatType.roomListDto>>,
    focusRoom: number,
    setFocusRoom: React.Dispatch<React.SetStateAction<number>>,
  },
  ban: boolean = false) {
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

export function emitRoomInAction() {
  const roomId = 1;
  const action = 'ban';

  socket.emit("room-inaction", {
    roomId,
    action,
  }, ({
    status,
    reason,
  }: {
    status: 'ok' | 'ko',
    reason?: string,
  }) => {

  });
}

export function emitUserBlock() {
  const targetId = 1;

  socket.emit("user-block", {
    targetId
  }, ({
    status,
    reason,
  }: {
    status: 'ok' | 'ko',
    reason?: string,
  }) => {

  });
}

export function emitUserInvite() {
  const targetId = 1;

  socket.emit("user-invite", {
    targetId
  }, ({
    status,
    reason,
  }: {
    status: 'ok' | 'ko',
    reason?: string,
  }) => {

  });
}

export function emitUserList() {
  const userId = 1;

  socket.emit("user-list", {
    userId
  }, ({
    userList,
  }: {
    userList: chatType.userDto,
  }) => {

  });
}

export function emitUserBlockList() {
  const userId = 1;

  socket.emit("user-block-list", {
    userId
  }, ({
    userList,
  }: {
    userList: chatType.userDto,
  }) => {

  });
}

export function emitDmHistoryList() {
  const userId = 1;

  socket.emit("dm-history-list", {
    userId
  }, ({
    userList,
  }: {
    userList: chatType.userDto,
  }) => {

  });
}

export function emitFollowingList() { //NOTE: API
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

export function emitMessage() {
  const type = 'room';
  const to = 1;
  const message = "test message";

  socket.emit("message", {
    type,
    to,
    message
  }, ({
    status,
    reason,
  }: {
    status: 'ok' | 'ko',
    reason?: 'string'
  }) => {

  });
}
