import { io } from 'socket.io-client';
import { useAtom } from "jotai";
import * as chatAtom from '../components/atom/ChatAtom';
import * as userAtom from '../components/atom/UserAtom';
import type * as chatType from './chat.dto';

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
  console.log("add core event listener");

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
    socket.emit("test", { message: "socket disconnected" });
  });

  // the connection is denied by the server in a middleware function
  socket.on("connect_error", (err) => {
    if (err.message === "unauthorized") {
      // handle each case
    }
    console.log(err.message); // prints the message associated with the error
  });
}

// export function OnSocketChatEvent() {
// }


export function emitRoomList(
  {
    setRoomList
  }: {
    setRoomList: React.Dispatch<React.SetStateAction<chatType.roomListDto>>,
  }
) {
  console.log('emit room list');
  socket.emit("room-list", ({
    roomList
  }: {
    roomList: chatType.roomListDto;
  }) => {
    if (roomList !== undefined && roomList !== null) {
      Object.entries(roomList).forEach(([key, value]) => {
        value.isJoined = false;
      });
      setRoomList({ ...roomList });
    }
  });
}

export function emitRoomCreate(
  roomName: string,
  roomCheck: boolean = false,
  roomPass: string = ''
) {
  const roomType = roomCheck
    ? 'private'
    : roomPass
      ? 'protected'
      : 'open';
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
  roomPass?: string,
) {
  socket.emit("room-join", {
    roomId,
    roomPass,
  }, ({
    status,
    payload
  }: {
    status: 'ok' | 'ko';
    payload?: string;
  }) => {
    switch (status) {
      case 'ok': {
        break;
      }
      case 'ko': {
        alert(`room-join fail: \n\n${payload}`);
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
    roomId
  }, ({
    status,
  }: {
    status: 'ok' | 'ko',
  }) => {
    if (status === 'ok') {
      console.log(`callback: room leaved: ${roomList[roomId].roomName}`);
      const newRoomList: chatType.roomListDto = {};
      newRoomList[roomId] = {
        roomName: roomList[roomId].roomName,
        roomType: roomList[roomId].roomType,
        isJoined: false,
        detail: {} as chatType.roomDetailDto,
      }
      setRoomList({ ...roomList, ...newRoomList });
      if (focusRoom === roomId) {
        setFocusRoom(-1);
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
  action: 'ban' | 'kick' | 'mute' | 'admin',
  targetId: number,
) {
  socket.emit("room-in-action", {
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
export function emitTest(
  message: string,
) {
  console.log(`emit test: ${message}`);
  socket.emit("test", {
    message
  }, ({
    fromServer
  }: {
    fromServer: string
  }) => {
    alert(`fromServer: ${fromServer}`);
  });
  return undefined
}
export function emitUserList(
  {
    userList,
    setUserList,
    userHistory,
    setUserHistory,
  }: {
    userList: chatType.userDto,
    setUserList: React.Dispatch<React.SetStateAction<chatType.userDto>>,
    userHistory: chatType.userDto,
    setUserHistory: React.Dispatch<React.SetStateAction<chatType.userDto>>,
  },
) {
  console.log('emit user list');
  socket.emit("user-list", {
  }, ({
    userListFromServer,
  }: {
    userListFromServer: chatType.userDto,
  }) => {
    setUserList({ ...userList, ...userListFromServer })
    setUserHistory({ ...userHistory, ...userList })
  });
}

export function emitUserBlockList(
  {
    userBlockList,
    setUserBlockList
  }: {
    userBlockList: chatType.userSimpleDto,
    setUserBlockList: React.Dispatch<React.SetStateAction<chatType.userSimpleDto>>,
  },
) {
  socket.emit("user-block-list", {
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
    userList,
    setUserList,
    dmHistoryList,
    setDmHistoryList
  }: {
    userList: chatType.userDto,
    setUserList: React.Dispatch<React.SetStateAction<chatType.userDto>>,
    dmHistoryList: chatType.userDto,
    setDmHistoryList: React.Dispatch<React.SetStateAction<chatType.userDto>>,
  },
) {
  socket.emit("dm-history-list", {
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
    userList,
    setUserList,
    followingList,
    setFollowingList
  }: {
    userList: chatType.userDto,
    setUserList: React.Dispatch<React.SetStateAction<chatType.userDto>>,
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
        setUserList({ ...followingList, ...userList })
        return undefined
      });
    })
    .catch((error) => {
      // TODO: refersh token and retry
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
        break;
      }
      case 'ko': {
        console.log(`message to ${roomId} is failed: \n\n${payload} `);
        alert(`message failed: ${payload}`);
        break;
      }
    }
  });
}
