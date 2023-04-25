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

export function OnSocketEvent() {
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

	//------------------------------------------------------------------------------------------

	socket.on("room-list-notify", ({
		action,
		userList,
	}: {
		action: 'add' | 'delete';
		userList: {
			[key: number]: {
				roomName: string;
				roomType: 'open' | 'protected';
			}
		}
	}) => {

	});


	socket.on("room-join", ({
		roomId,
		roomName,
		userList = {}
	}: {
		roomId: number,
		roomName: string,
		userList: chatType.userListDto
	}) => {

	});


	socket.on("room-inaction", ({
		roomId,
		action
	}: {
		roomId: number;
		action: 'ban' | 'kick' | 'mute' | 'admit-admin'
	}) => {

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

export function emitRoomCreate() {
	const roomName = 'test_room_name';
	const roomType = 'open';
	const roomPass = "aoiresnt";

	socket.emit("room-create", {
		roomName,
		roomType,
		roomPass,
	}, ({
		status,
		reason,
	}: {
		status: 'ok' | 'ko',
		reason?: string,
	}) => {

	});
}

export function emitRoomJoin() {
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
		userList?: chatType.userListDto,
	}) => {

	});
}

export function emitRoomLeave() {
	const roomId = 1;

	socket.emit("room-leave", {
		roomId,
	}, ({
		userList,
	}: {
		userList: chatType.userListDto,
	}) => {

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

export function emitUserIgnore() {
	const targetId = 1;

	socket.emit("user-ignore", {
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
		userList: chatType.userListDto,
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
		userList: chatType.userListDto,
	}) => {

	});
}

export function emitFollowingList() {
	const userId = 1;

	socket.emit("following-list", {
		userId
	}, ({
		userList,
	}: {
		userList: chatType.userListDto,
	}) => {

	});
}
