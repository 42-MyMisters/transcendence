import { io } from 'socket.io-client';
import { useAtom } from "jotai";
import * as chatAtom from '../components/atom/ChatAtom';
import * as userAtom from '../components/atom/UserAtom';
import type * as chatType from './chat.dto';

import { AdminLogPrinter } from '../event/event.util';

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

export function emitRoomCreate(
	adminConsole: boolean,
	roomName: string,
	roomCheck: boolean = false,
	roomPass: string = '',
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
		payload,
	}: {
		status: 'ok' | 'ko',
		payload?: string,
	}) => {
		switch (status) {
			case 'ok': {
				AdminLogPrinter(adminConsole, "room-create success");
				break;
			}
			case 'ko': {
				AdminLogPrinter(adminConsole, "room-create fail");
				alert(`${roomName} room-create fail ${payload}`);
				break;
			}
		};
	});
}

export function emitRoomEdit(
	adminConsole: boolean,
	roomId: number,
	roomName: string = '',
	roomCheck: boolean = false,
	roomPass: string = '',
	roomCurrentType: 'open' | 'private' | 'protected' | 'dm',
) {
	if (roomCurrentType === 'dm') {
		alert(`dm room can't be edited`);
		return;
	}
	const roomType = roomCheck
		? 'private'
		: roomCurrentType === 'protected'
			? 'protected'
			: roomPass !== ''
				? 'protected'
				: 'open'
	socket.emit("room-edit", {
		roomId,
		roomName,
		roomType,
		roomPass,
	}, ({
		status,
		payload,
	}: {
		status: 'ok' | 'ko',
		payload?: string,
	}) => {
		switch (status) {
			case 'ok': {
				AdminLogPrinter(adminConsole, "room-edit success");
				break;
			}
			case 'ko': {
				AdminLogPrinter(adminConsole, "room-edit fail");
				alert(`${roomName} room-edit fail ${payload}`);
				break;
			}
		};
	});
}

export function emitRoomJoin(
	{
		adminConsole,
		roomList,
		setRoomList,
		focusRoom,
		setFocusRoom
	}: {
		adminConsole: boolean,
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
				AdminLogPrinter(adminConsole, `${roomList[roomId].roomName} room-join success`);
				break;
			}
			case 'ko': {
				alert(`room-join fail: \n\n${payload}`);
				break;
			}
		}
	});
}

export function emitRoomInvite(adminConsole: boolean, roomId: number, targetName: string) {
	socket.emit("room-invite", { roomId, targetName }, ({
		status,
		payload }: {
			status: 'ok' | 'ko';
			payload?: string
		}) => {
		if (status === 'ok') {
			AdminLogPrinter(adminConsole, `callback: room-invite success`);
		} else {
			alert(`room-invite fail: ${payload}`)
		}
	})
}

export function emitRoomLeave(
	{
		adminConsole,
		roomList,
		setRoomList,
		focusRoom,
		setFocusRoom
	}: {
		adminConsole: boolean
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
		status: 'leave' | 'delete',
	}) => {
		if (status === 'leave') {
			AdminLogPrinter(adminConsole, `callback: room leaved: ${roomList[roomId].roomName}`);
			if (roomList[roomId].roomType === 'private') {
				const newRoomList: chatType.roomListDto = { ...roomList };
				delete newRoomList[roomId];
				setRoomList({ ...newRoomList });
			} else {
				const newRoomList: chatType.roomListDto = {};
				newRoomList[roomId] = {
					roomName: roomList[roomId].roomName,
					roomType: roomList[roomId].roomType,
					isJoined: false,
				}
				setRoomList({ ...roomList, ...newRoomList });
			}
			if (focusRoom === roomId) {
				setFocusRoom(-1);
			}
		} else if (status === 'delete') {
			AdminLogPrinter(adminConsole, `callback: room delete: ${roomList[roomId].roomName}`);
		} else {
			AdminLogPrinter(adminConsole, 'callback: room leave failed');
		}
	});
}

export function emitRoomInAction(
	{
		adminConsole,
		roomList,
		setRoomList,
	}: {
		adminConsole: boolean,
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
				AdminLogPrinter(adminConsole, `room - inaction in ${roomId} to ${targetId} with ${action} OK`);
				break;
			}
			case 'ko': {
				AdminLogPrinter(adminConsole, `room - inaction in ${roomId} to ${targetId} with ${action} failed: ${payload} `);
				alert(`Room in Action [${action}] is faild: ${payload}`);
				break;
			}
		}
	});
}

export function emitMessage({ adminConsole, roomList }: { adminConsole: boolean, roomList: chatType.roomListDto, }, roomId: number, message: string,) {
	if (roomList[roomId]?.detail?.myRoomStatus === 'mute') {
		alert('You are muted for 10 sec in this room');
		return;
	}
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
				AdminLogPrinter(adminConsole, `message to ${roomList[roomId].roomName} is sended: ${message} `);
				break;
			}
			case 'ko': {
				AdminLogPrinter(adminConsole, `message to ${roomId} is failed: \n\n${payload} `);
				alert(`message failed: ${payload}`);
				break;
			}
		}
	});
}

export function setNewDetailToNewRoom({
	roomList,
	setRoomList,
	roomId,
	newUserList,
}: {
	roomList: chatType.roomListDto,
	setRoomList: React.Dispatch<React.SetStateAction<chatType.roomListDto>>,
	roomId: number,
	newUserList: chatType.userInRoomListDto
}, status?: chatType.userRoomStatus,
	power?: chatType.userRoomPower) {
	const newRoomList: chatType.roomListDto = {}
	newRoomList[roomId] = {
		roomName: roomList[roomId].roomName,
		roomType: roomList[roomId].roomType,
		isJoined: roomList[roomId].isJoined,
		detail: {
			userList: { ...newUserList },
			messageList: roomList[roomId].detail?.messageList || [],
			myRoomStatus: status || roomList[roomId].detail?.myRoomStatus! || 'normal',
			myRoomPower: power || roomList[roomId].detail?.myRoomPower! || 'member'
		}
	};
	setRoomList({ ...roomList, ...newRoomList });
}


export function emitBlockUser({
	adminConsole,
	blockList,
	setBlockList,
}: {
	adminConsole: boolean,
	blockList: chatType.userSimpleDto,
	setBlockList: React.Dispatch<React.SetStateAction<chatType.userSimpleDto>>,
},
	targetId: number,
	doOrUndo: boolean,
) {
	if (doOrUndo) {
		AdminLogPrinter(adminConsole, `block user: ${targetId}`);
	} else {
		AdminLogPrinter(adminConsole, `unblock user: ${targetId}`);
	}
	socket.emit("user-block", {
		targetId,
		doOrUndo
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
				setBlockList({ ...blockList, ...newBlockUser });
				break;
			}
			case 'off': {
				const newBlockList: chatType.userSimpleDto = { ...blockList };
				delete newBlockList[targetId];
				setBlockList({ ...newBlockList });
				break;
			}
			case 'ko': {
				AdminLogPrinter(adminConsole, `user - block failed: ${payload} `);
				alert(`block failed: ${payload}`);
				break;
			}
		}
	});
}


export function emitDmRoomCreate(adminConsole: boolean, targetId: number,) {
	socket.emit("dm-room-create", {
		targetId,
	}, ({
		status
	}: {
		status: 'ok' | 'ko',
	}) => {
		if (status === 'ok') {
			AdminLogPrinter(adminConsole, `dm room create to ${targetId} is sended`);
		} else {
			AdminLogPrinter(adminConsole, `dm room create to ${targetId} is failed`);
		}
	});
}

export function emitDM(adminConsole: boolean, targetId: number, message: string) {
	socket.emit("message-dm", {
		targetId,
		message
	}, ({
		status,
	}: {
		status: 'ok' | 'ko',
	}) => {
		if (status === 'ok') {
			AdminLogPrinter(adminConsole, `dm to ${targetId} is sended: ${message}`);
		} else {
			AdminLogPrinter(adminConsole, `dm to ${targetId} is failed: ${message}`);
		}
	})
}
