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
	socket: Socket;
	status: userStatus;
	blockedUsers: number[];
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

const userList: Record<number, UserInfo> = {};
const roomList: Record<number, RoomInfo> = {};
let ROOM_NUMBER = 1;

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
				this.nsp.emit("room-clear");
				this.nsp.emit("user-clear");

				socket.data.user = user;
				socket.data.roomList = [];
				if (userList[uid] === undefined) {
					userList[uid] = {
						socket: socket,
						status: 'online',
						blockedUsers: [],
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

	handleDisconnect(@ConnectedSocket() socket: Socket) {
		this.logger.log(`${socket.id} socket disconnected`);
		this.logger.log(`${socket.data.roomList}`);
		console.log('disconnected');
		userList[socket.data.user.uid].status = 'offline';
		socket.broadcast.emit("user-update", {
			userId: socket.data.user.uid,
			userDisplayName: socket.data.user.nickname.split('#', 2)[0],
			userProfileUrl: socket.data.user.profileUrl,
			userStatus: userList[socket.data.user.uid].status,
		});
		socket.data.roomList.map((roomNumber: number) => {
			let roomMemberCount = 0;
			Object.entries(roomList[roomNumber].roomMembers).forEach(() => {
				roomMemberCount++;
				if (roomMemberCount === 1) {
					this.EmitRoomListNotify(socket, { action: 'delete', roomName: roomList[roomNumber].roomName, roomId: roomNumber, roomType: roomList[roomNumber].roomType });
					delete roomList[roomNumber];
				} else {
					this.EmitRoomInAction(socket, { roomId: roomNumber, action: 'leave', targetId: socket.data.user.uid });
					delete roomList[roomNumber].roomMembers[socket.data.user.uid];
				}
			});
		});
		// delete userList[socket.data.user.uid];
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

	@SubscribeMessage("user-list")
	// handleUserList(@ConnectedSocket() socket: Socket) {
	handleUserList() {
		const tempUserList: Record<number, ClientUserDto> = {};
		for (const [uid, userInfo] of Object.entries(userList)) {
			tempUserList[uid] = {
				userDisplayName: userInfo.socket.data.user.nickname.split('#', 2)[0],
				userProfileUrl: userInfo.socket.data.user.profileUrl,
				userStatus: userInfo.status,
			};
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
			return { status: 'ko' };
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

	EmitRoomInAction(socket: Socket, {
		roomId,
		action,
		targetId
	}) {
		this.logger.log(`room-in-action : ${action} ${roomId} ${targetId}`);
		this.nsp.to(roomId.toString()).emit("room-in-action", {
			roomId,
			action,
			targetId,
		});
	}

}
