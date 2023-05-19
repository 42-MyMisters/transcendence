import { Socket, io } from "socket.io-client";
import { atom } from "jotai";
// import * as chatAtom from '../components/atom/SocketAtom';
// import type * as gameType from './game.dto';

// const URL = process.env.REACT_APP_API_URL;
const URL = "https://wchaeserver.mooo.com";

const GameNameSpace = "/game";

// export const gameSocket = io(`${URL}${GameNameSpace}`, {
//   auth: (cb) => {
//     cb({
//       token: localStorage.getItem("refreshToken")
//     });
//   },
//   autoConnect: false,
//   transports: ["polling", "websocket"],
//   secure: true,
//   upgrade: true,
//   // reconnectionDelay: 1000, // defaults to 1000
//   // reconnectionDelayMax: 10000, // defaults to 5000
//   // withCredentials: true,
//   // path: "/socket.io",
// });

// export function emitUpPress() {
//   gameSocket.emit("upPress");
// }
// export function emitUpRelease() {
//   gameSocket.emit("upRelease");
// }

// export function emitDownPress() {
//   gameSocket.emit("downPress");
// }

// export function emitDownRelease() {
//   gameSocket.emit("downRelease");
// }
