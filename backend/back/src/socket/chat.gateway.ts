import { Logger, UnauthorizedException } from "@nestjs/common";
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from "@nestjs/websockets";
import { Namespace, Socket } from "socket.io";
import { AuthService } from "src/auth/auth.service";
import { User } from "src/database/entity/user.entity";
import { UserBlock } from "src/database/entity/user-block.entity";
import { UserService } from "src/user/user.service";
import { subscribeOn } from 'rxjs';

type roomType = 'open' | 'protected' | 'private';
type userStatus = 'online' | 'offline' | 'inGame';
type userRoomStatus = 'normal' | 'mute' | 'ban' | 'kick';
type userRoomPower = 'owner' | 'admin' | 'member';

interface ClientUserDto {
	userDisplayName: string;
	userProfileUrl: string;
	userStatus: userStatus;
}

type ClientRoomListDto = {
	roomName: string;
	roomType: 'open' | 'protected' | 'private';
}

interface UserInfo {
	socket?: Socket;
	status: userStatus;
	blockedUsers: number[];
	userId?: number;
	userDisplayName?: string;
	userUrl?: string;
}

interface RoomMember {
	userRoomStatus: userRoomStatus;
	userRoomPower: userRoomPower;
}

interface RoomInfo {
	roomNumber: number;
	roomName: string;
	roomType: roomType;
	roomMembers: Record<number, RoomMember>;
	roomOwner: number;
	roomAdmins: number[];
	bannedUsers: number[];
	roomPass?: string;
}

const userList: Record<number, UserInfo> = {
	0: {
		status: 'online',
		blockedUsers: [],
		userId: 0,
		userDisplayName: 'Norminette',
		userUrl: "https://pbs.twimg.com/profile_images/1150849282913779713/piO0pkT5_400x400.jpg"
	},
	1: {
		status: 'offline',
		blockedUsers: [],
		userId: 1,
		userDisplayName: 'Elon Musk',
		userUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg/1200px-Elon_Musk_Royal_Society_%28crop2%29.jpg",
	},
	2: {
		status: 'inGame',
		blockedUsers: [],
		userId: 2,
		userDisplayName: '42_DALL',
		userUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/%EC%9D%B4%EB%AF%BC%EC%84%9D%EA%B5%90%EC%88%98-%EC%82%AC%EC%A7%84.jpg/1200px-%EC%9D%B4%EB%AF%BC%EC%84%9D%EA%B5%90%EC%88%98-%EC%82%AC%EC%A7%84.jpg",
	},
};
const roomList: Record<number, RoomInfo> = {
	0: {
		roomNumber: 0,
		roomName: 'Open Lobby',
		roomType: 'open',
		roomMembers: {
			0: {
				userRoomStatus: 'normal',
				userRoomPower: 'owner',
			},
			1: {
				userRoomStatus: 'mute',
				userRoomPower: 'admin',
			}
		},
		roomOwner: 0,
		roomAdmins: [1],
		bannedUsers: [],
	},
	1: {
		roomNumber: 0,
		roomName: 'Protected Lobby',
		roomType: 'protected',
		roomMembers: {
			0: {
				userRoomStatus: 'normal',
				userRoomPower: 'owner',
			},
			1: {
				userRoomStatus: 'mute',
				userRoomPower: 'admin',
			},
			2: {
				userRoomStatus: 'normal',
				userRoomPower: 'member',
			}
		},
		roomOwner: 0,
		roomAdmins: [1],
		bannedUsers: [],
		roomPass: '42',
	},
};
let ROOM_NUMBER = 2;

@WebSocketGateway({ namespace: "sock", cors: { origin: "*" } })
export class EventsGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private userService: UserService,
		private authService: AuthService
	) { }

	private logger = new Logger("Gateway");

	@WebSocketServer()
	nsp: Namespace;

	afterInit() {
		this.logger.log("socket initialized");
	}

	async handleConnection(@ConnectedSocket() socket: Socket) {
		try {
			this.logger.log(`${socket.id} socket connected.`);
			const uid = await this.authService.jwtVerify(socket.handshake.auth.token);
			const user = await this.userService.getUserByUid(uid);
			if (this.userService.isUserExist(user)) {
				this.nsp.to(socket.id).emit("room-clear");
				this.nsp.to(socket.id).emit("user-clear");

				socket.data.user = user;
				socket.data.roomList = [];
				if (userList[uid] === undefined) {
					userList[uid] = {
						socket: socket,
						status: 'online',
						blockedUsers: [],
						userId: user.uid,
						userDisplayName: user.nickname.split('#', 2)[0],
						userUrl: user.profileUrl,
					};
					try { // TODO: check
						console.log(user?.blockedUsers.map((blockedUsers) => blockedUsers.targetToBlockId));
					} catch (e) {
						console.log("blockedUsers is undefined");
					}
					this.logger.log(`${socket.data.user.nickname} first connected.`);
				} else {
					userList[socket.data.user.uid].status = 'online';
					this.logger.log(`${socket.data.user.nickname} refreshed.`);
				}
				this.nsp.emit("user-update", {
					userId: socket.data.user.uid,
					userDisplayName: socket.data.user.nickname.split('#', 2)[0],
					userProfileUrl: socket.data.user.profileUrl,
					userStatus: userList[socket.data.user.uid].status,
				});
			} else {
				throw new UnauthorizedException("User not found.");
			}
		} catch (e) {
			this.logger.log(`${socket.id} invalid connection. disconnect socket.`);
			socket.disconnect();
		}
	}

	deleteRoomLogic(socket: Socket, roomId: number) {
		let roomMemberCount = 0;
		let action: 'delete' | 'leave' = 'leave'
		if (roomList[roomId] !== undefined) {
			Object.entries(roomList[roomId]?.roomMembers).forEach(() => {
				roomMemberCount++;
			});
			if (roomMemberCount === 1) {
				this.EmitRoomListNotify(socket, { action: 'delete', roomName: roomList[roomId].roomName, roomId, roomType: roomList[roomId].roomType });
				delete roomList[roomId];
				this.logger.verbose(`Room ${roomId} deleted.\n`);
				action = 'delete';
			} else {
				socket.to(roomId.toString()).emit("room-in-action", {
					roomId,
					action: 'leave',
					targetId: socket.data.user.uid,
				});
				delete roomList[roomId].roomMembers[socket.data.user.uid];
			}
			socket.leave(roomId.toString());
			delete socket.data.roomList[roomId];
			return action;
		}
	}

	handleDisconnect(@ConnectedSocket() socket: Socket) {
		this.logger.log(`${socket.id} socket disconnected`);
		this.logger.log(`${socket.data.roomList}`);
		if (socket.data?.user?.uid !== undefined) {
			userList[socket.data.user.uid].status = 'offline';
			socket.broadcast.emit("user-update", {
				userId: socket.data.user.uid,
				userDisplayName: socket.data.user.nickname.split('#', 2)[0],
				userProfileUrl: socket.data.user.profileUrl,
				userStatus: userList[socket.data.user.uid].status,
			});
			socket.data.roomList.map((roomId: number) => {
				this.deleteRoomLogic(socket, roomId);
			});
			delete userList[socket.data.user.uid];
		}
	}

	@SubscribeMessage("clear-data")
	handleClearData(@ConnectedSocket() socket: Socket) {
		this.logger.log(`${socket.id} clear data`);
		this.nsp.emit("room-clear");
		this.nsp.emit("user-clear");
	}

	@SubscribeMessage("test")
	handleTest(
		@MessageBody() { message }: { message: string }
	) {
		console.log(`fromClient: ${message}`);
		return { fromServer: message };
	}

	@SubscribeMessage("room-create")
	handleRoomCreate(
		@ConnectedSocket() socket: Socket,
		@MessageBody() {
			roomName,
			roomType,
			roomPass,
		}: {
			roomName: string;
			roomType: roomType;
			roomPass?: string;
		}) {
		const trimmedRoomName = roomName.trim();
		if (trimmedRoomName.length > 0 && trimmedRoomName.length <= 12) {
			const newMember: RoomMember = {
				userRoomStatus: 'normal',
				userRoomPower: 'owner',
			};
			const roomMembers: Record<number, RoomMember> = {};
			roomMembers[socket.data.user.uid] = newMember;
			const newRoom: RoomInfo = {
				roomNumber: ROOM_NUMBER,
				roomName: trimmedRoomName,
				roomType: roomType,
				roomMembers: roomMembers,
				roomOwner: socket.data.user.uid,
				roomAdmins: [],
				bannedUsers: [],
				roomPass: roomPass ?? '', // TODO : 암호화
			}
			roomList[ROOM_NUMBER] = newRoom;
			socket.data.roomList.push(ROOM_NUMBER);
			socket.join(ROOM_NUMBER.toString());
			if (roomType !== 'private') {
				this.EmitRoomListNotify(socket, { action: 'add', roomId: ROOM_NUMBER, roomName: trimmedRoomName, roomType });
			}
			this.EmitRoomJoin(socket, { roomId: ROOM_NUMBER, roomName: trimmedRoomName, roomType, roomMembers, myPower: 'owner', status: 'ok' });
			ROOM_NUMBER++;
		} else {
			return { status: 'ko' };
		}
		return { status: 'ok' };
	}

	@SubscribeMessage("room-list")
	handleRoomList(@ConnectedSocket() socket: Socket) {
		const tempRoomList: Record<number, ClientRoomListDto> = {};
		for (const [roomId, roomInfo] of Object.entries(roomList)) {
			if (roomInfo.roomType !== 'private') {
				tempRoomList[roomId] = {
					roomName: roomInfo.roomName,
					roomType: roomInfo.roomType,
				};
			}
		}
		return { roomList: tempRoomList };
	}

	@SubscribeMessage("room-join")
	handleRoomJoin(
		@ConnectedSocket() socket: Socket,
		@MessageBody() {
			roomId,
			roomPass,
		}: {
			roomId: number;
			roomPass?: string;
		}) {
		if (roomList[roomId]) {
			switch (roomList[roomId].roomType) {
				case 'protected': {
					if (roomList[roomId].roomPass !== roomPass) {
						return ({ status: 'ko', payload: 'password incorrect' });
					}
				}
				case 'open': {
					const newMember: RoomMember = {
						userRoomStatus: 'normal',
						userRoomPower: 'member',
					}
					roomList[roomId].roomMembers[socket.data.user.uid] = newMember;
					socket.join(roomId.toString());
					socket.data.roomList.push(roomId);
					this.EmitRoomJoin(socket, {
						roomId,
						roomName: roomList[roomId].roomName,
						roomType: roomList[roomId].roomType,
						roomMembers: roomList[roomId].roomMembers,
						myPower: 'member',
						status: 'ok'
					});
					this.nsp.to(roomId.toString()).emit('room-in-action', {
						roomId,
						action: 'newMember',
						targetId: socket.data.user.uid,
					});
					return ({ status: 'ok' });
				}
				case 'private': {
					return ({ status: 'ko', payload: 'only can join with invite' });
				}
				default: {
					return ({ status: 'ko', payload: 'room type error' });
				}
			}
		} else {
			return ({ status: 'ko', payload: 'room not found' });
		}
	}

	@SubscribeMessage("room-leave")
	handleRoomLeave(
		@ConnectedSocket() socket: Socket,
		@MessageBody() {
			roomId,
		}: {
			roomId: number;
		}) {
		this.logger.log(`${socket.id}:${socket.data.user.nickname} leave room ${roomId}`);
		if (this.deleteRoomLogic(socket, roomId) === 'leave') {
			return ({ status: 'ok' });
		} else {
			return ({ status: 'ko' });
		}
	}

	@SubscribeMessage("user-list")
	handleUserList() {
		const tempUserList: Record<number, ClientUserDto> = {};
		for (const [uid, userInfo] of Object.entries(userList)) {
			if (Number(uid) <= 2) {
				tempUserList[uid] = {
					userDisplayName: userInfo.userDisplayName || 'test user',
					userProfileUrl: userInfo.userUrl || 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/42_Logo.svg/2048px-42_Logo.svg.png',
					userStatus: userInfo.status,
				}
			}
			else {
				tempUserList[uid] = {
					userDisplayName: userInfo.socket?.data.user.nickname.split('#', 2)[0],
					userProfileUrl: userInfo.socket?.data.user.profileUrl,
					userStatus: userInfo.status,
				};
			}
		}
		return { userListFromServer: tempUserList };
	}

	@SubscribeMessage("message")
	handleMessage(
		@ConnectedSocket() socket: Socket,
		@MessageBody() {
			roomId,
			message
		}: {
			roomId: number,
			message: string
		}) {
		if (roomList[roomId] === undefined) {
			return { status: 'ko', payload: '방에 참여하세요\n선택된 방이 없습니다.' };
		}
		this.nsp.to(String(roomId)).emit("message", {
			roomId,
			from: socket.data.user.uid,
			message,
		});
		return { status: 'ok' };
	}

	EmitRoomJoin(socket: Socket, {
		roomId,
		roomName,
		roomType,
		roomMembers,
		myPower,
		status
	}) {
		this.nsp.to(socket.id).emit("room-join", {
			roomId,
			roomName,
			roomType,
			userList: roomMembers,
			myPower,
			status,
		})
	}

	EmitRoomListNotify(socket: Socket, {
		action,
		roomId,
		roomName,
		roomType,
	}) {
		this.logger.log(`room-list-notify : ${action} ${roomId} ${roomName} ${roomType}`);
		this.nsp.emit("room-list-notify", {
			action,
			roomId,
			roomName,
			roomType,
		})
	}

	@SubscribeMessage("server-room-list")
	handleServerRoomList(@ConnectedSocket() socket: Socket) {
		this.logger.verbose("server-room-list");
		Object.entries(roomList).forEach(([roomId, roomInfo]) => {
			console.log(`\n${roomInfo.roomName} :${roomId}:  ${roomInfo.roomType} ${roomInfo.roomPass}`);
			Object.entries(roomInfo.roomMembers).forEach(([uid, memberInfo]) => {
				console.log(`\t${userList[uid].userDisplayName}:${uid}: \t\t${memberInfo.userRoomStatus} ${memberInfo.userRoomPower}`);
			});
		});
	}

	@SubscribeMessage("server-user-list")
	handleServerUserList(@ConnectedSocket() socket: Socket) {
		this.logger.verbose("server-user-list");
		Object.entries(userList).forEach(([uid, userInfo]) => {
			console.log(`\n${userInfo.userDisplayName}:${uid}: ${userInfo.status}`);
		});
	}

}
