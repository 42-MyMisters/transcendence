import { io } from 'socket.io-client';
import { useAtom } from "jotai";
import { focusRoomAtom, chatInfoAtom } from '../components/atom/SocketAtom';

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

export const OnSocketEvent = () => {

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


export const emitDeleteRoom = (room: string) => {
	socket.emit("delete-Room", { room });
};

export const emitMessage = (roomName: string, message: string) => {
	socket.emit("message", { roomName, message });
};

export const emitRoomList = () => {
	socket.emit("room-list");
};
export const emitCreateRoom = (roomName: string) => {
	socket.emit("create-room", { roomName });
};

export const emitJoinRoom = (roomName: string) => {
	socket.emit("joinNroom", { roomName });
};

export const emitLeaveRoom = (roomName: string) => {
	socket.emit("leave-room", { roomName });
};



/**
 * TODO: 1. 최초 연결시, 방 목록, dm 목록, 유저 목록(팔로워)을 받아온다.
 * 채팅 화면은 아무것도 연결 안되어 있는 상태. 방 클릭하면 그 방으로 접속 시도
 */

/**
 * TODO: 2. 방 클릭시, 방에 접속한다.
 * protected 방이면 비민 번호를 입력후, 맞으면 접속
 * 채팅 화면이 접속한 방 정보로 변경.
 */

/**
 * TODO: 3. 유저 클릭시, 유저랑 DM.
 * NOTE: 상대가 나를, 내가 상대를 block 되어 있으면?
 */

/**
 * TODO: 4. 방에서 유저 클릭시 userInfoModal을 띄우고 각 기능 수행
 */

/**
 * TODO: 5. 채팅 엔터, 버튼 클릭시 현재 접속한 방에 메시지 전송
 * 아무런 방에 접속하지 않은채 메시지 전송시, 아무것도 안되게
 */

/**
 * TODO: 6. 채팅방에서 나가기
 * 방장이면 방 삭제??
 * 권환 초기화 및 방 정보 초기화
 */

/**
 * TODO: 7. 채팅방에서 상호작용
 */
