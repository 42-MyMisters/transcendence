import { io } from 'socket.io-client';
import { useAtom } from "jotai";
// import * as chatAtom from '../components/atom/SocketAtom';
// import type * as gameType from './game.dto';

const URL = "https://localhost";
const GameNameSpace = "/game";

export const gameSocket = io(`${URL}${GameNameSpace}`, {
  auth: (cb) => {
    cb({ token: localStorage.getItem("refreshToken") });
  },
  autoConnect: false,
  transports: ["polling", "websocket"],
  secure: true,
  // upgrade: true,
  // reconnectionDelay: 1000, // defaults to 1000
  // reconnectionDelayMax: 10000, // defaults to 5000
  // withCredentials: true,
  // path: "/socket.io",
});

// export function OnSocketCoreEvent() {

//   // catch all incoming events
//   gameSocket.onAny((eventName, ...args) => {
//     AdminLogPrinter(adminConsole, "incoming ", eventName, args);
//   });

//   // catch all outgoing events
//   gameSocket.prependAny((eventName, ...args) => {
//     AdminLogPrinter(adminConsole, "outgoing ", eventName, args);
//   });

//   gameSocket.on("connect", () => {
//     if (gameSocket.connected) {
//       //This attribute describes whether the socket is currently connected to the server.
//       if (gameSocket.recovered) {
//         // any missed packets will be received
//       } else {
//         // new or unrecoverable session
//         AdminLogPrinter(adminConsole, "gameSocket connected : " + gameSocket.id);
//       }
//     }
//   });

//   //https://socket.io/docs/v4/client-socket-instance/#disconnect
//   gameSocket.on("disconnect", (reason) => {
//     /**
//      *  BAD, will throw an error
//      *  gameSocket.emit("disconnect");
//     */
//     if (reason === "io server disconnect") {
//       // the disconnection was initiated by the server, you need to reconnect manually
//     }
//     // else the socket will automatically try to reconnect
//     AdminLogPrinter(adminConsole, "gameSocket disconnected");
//   });

//   // the connection is denied by the server in a middleware function
//   gameSocket.on("connect_error", (err) => {
//     if (err.message === "unauthorized") {
//       // handle each case
//     }
//     AdminLogPrinter(adminConsole, err.message); // prints the message associated with the error
//   });

// gameSocket.on('join-game', ({
//   uid_left,
//   p1,
//   uid_right
// }: {
//   uid_left: string;
//   p1: number;
//   uid_right: string;
// }) => {

// });

// gameSocket.on('graphic', ({
//   p1,
//   ball_x,
//   ball_y,
//   p2
// }: {
//   p1: number;
//   ball_x: number;
//   ball_y: number;
//   p2: number;
// }) => {

// });
// }

export function OnSocketGameEvent() {
  // const [roomList, setRoomList] = useAtom(chatAtom.roomListAtom);

}

export function emitUpPress() {
  gameSocket.emit("upPress");
}
export function emitUpRelease() {

  gameSocket.emit("upRelease");
}

export function emitDownPress() {
  gameSocket.emit("downPress");
}

export function emitDownRelease() {
  gameSocket.emit("downRelease");
}
