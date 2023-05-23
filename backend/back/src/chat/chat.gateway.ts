/* eslint-disable prettier/prettier */
import { ConflictException, Logger, UnauthorizedException, UnprocessableEntityException } from "@nestjs/common";
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
import { DirectMessage } from 'src/database/entity/direct-message.entity';
import { UserFollow } from "src/database/entity/user-follow.entity";
import { UserBlock } from "src/database/entity/user-block.entity";
import { UserService } from "src/user/user.service";
import { DatabaseService } from "src/database/database.service";
import * as bcrypt from 'bcrypt';


type roomType = 'open' | 'protected' | 'private' | 'dm';
type userStatus = 'online' | 'offline' | 'inGame';
type gameStatus = 'ready' | 'playing' | 'end';
type userRoomStatus = 'normal' | 'mute';
type userRoomPower = 'owner' | 'admin' | 'member';

interface leaderboardDto {
	nickname: string;
	elo: number;
	winGameCount: number;
	lostGameCount: number;
	totalGameCount: number;
}

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
	disconnectedSocket?: string;
	status: userStatus;
	gameStatus?: gameStatus;
	blockList: number[];
	followList: number[];
	userId?: number;
	userDisplayName?: string;
	userUrl?: string;
	isRefresh: boolean;
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

const roomNumberQueue: number[] = [];

const userList: Record<number, UserInfo> = {
	0: {
		status: 'online',
		blockList: [],
		followList: [],
		userId: 0,
		userDisplayName: 'Norminette',
		userUrl: "https://pbs.twimg.com/profile_images/1150849282913779713/piO0pkT5_400x400.jpg",
		isRefresh: false,
	},
	1: {
		status: 'inGame',
		blockList: [],
		followList: [],
		userId: 1,
		userDisplayName: 'Elon Musk',
		userUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg/1200px-Elon_Musk_Royal_Society_%28crop2%29.jpg",
		isRefresh: false,
	},
	2: {
		status: 'inGame',
		blockList: [],
		followList: [],
		userId: 2,
		userDisplayName: '42_DALL',
		userUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/%EC%9D%B4%EB%AF%BC%EC%84%9D%EA%B5%90%EC%88%98-%EC%82%AC%EC%A7%84.jpg/1200px-%EC%9D%B4%EB%AF%BC%EC%84%9D%EA%B5%90%EC%88%98-%EC%82%AC%EC%A7%84.jpg",
		isRefresh: false,
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
			},
			2: {
				userRoomStatus: 'normal',
				userRoomPower: 'admin',
			}
		},
		roomOwner: 0,
		roomAdmins: [85340],
		bannedUsers: [],
	},
	1: {
		roomNumber: 1,
		roomName: 'Protect Lobby',
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
				userRoomPower: 'admin',
			}
		},
		roomOwner: 0,
		roomAdmins: [],
		bannedUsers: [],
		roomPass: '42',
	},
	2: {
		roomNumber: 2,
		roomName: 'Private Lobby',
		roomType: 'private',
		roomMembers: {},
		roomOwner: 0,
		roomAdmins: [],
		bannedUsers: [],
		roomPass: '42',
	},
};

let ROOM_NUMBER = 3;
let ROOM_COUNT = 3;
const MAX_ROOM_COUNT = 200;
let leaderBoard = [] as leaderboardDto[];

@WebSocketGateway({ namespace: "sock", cors: { origin: "*" } })
export class EventsGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private userService: UserService,
		private authService: AuthService,
		private databaseService: DatabaseService,
	) { }

	private logger = new Logger("Chat");

	@WebSocketServer()
	nsp: Namespace;

	async afterInit() {
		this.logger.debug("Chat socket initialized");
		leaderBoard = await this.databaseService.getLeaderboard()
		this.leaderBoardTimer();
	}

	leaderBoardTimer() {
		setInterval(async () => {
			this.logger.verbose(`leaderboard update`);
			leaderBoard = await this.databaseService.getLeaderboard()
			this.nsp.emit("leaderboard-update", leaderBoard);
		}, 300000);
	}

	async handleConnection(@ConnectedSocket() socket: Socket) {
		try {
			this.logger.warn(`${socket.id} socket connected.`);
			const uid = await this.authService.jwtVerify(socket.handshake.auth.token);
			const user = await this.userService.getUserByUid(uid);

			if (!socket.connected) {
				throw new ConflictException();
			}

			if (this.userService.isUserExist(user)) {
				this.nsp.to(socket.id).emit("room-clear");
				this.nsp.to(socket.id).emit("user-clear");
				socket.data.user = user;
				socket.data.roomList = [];
				if (userList[uid] === undefined) {
					this.logger.debug(`${user.nickname} first connected.`);
					userList[uid] = {
						socket: undefined,
						disconnectedSocket: undefined,
						status: 'online',
						gameStatus: 'end',
						blockList: [],
						followList: [],
						userId: user.uid,
						userDisplayName: user.nickname,
						userUrl: user.profileUrl,
						isRefresh: false,
					};
				} else if (userList[uid].status !== 'offline') {
					this.logger.debug(`[${userList[uid].status}]-${user.nickname} multi connection. - ${socket.id}`);
					if (userList[uid].socket !== undefined) {
						this.logger.warn(`${user.nickname} is already connected. - ${userList[uid]!.socket!.id} <> ${socket.id}`)
						this.nsp.to(userList[uid]!.socket!.id).emit("multiple-login");
					}
				} else {
					this.logger.debug(`[${userList[uid].status}]-${user.nickname} reconnect - ${socket.id}`);
					userList[uid].isRefresh = true;
				}

				if (userList[uid].disconnectedSocket !== socket.id) {
					this.logger.debug(`${userList[uid].userDisplayName} is now online : ${socket.id}`);
					userList[uid].status = 'online';
					userList[uid].gameStatus = 'end';
					userList[uid].socket = socket;
					await this.handleBlockList(socket);
					await this.handleFollowList(socket, uid);
					this.handleRoomList(socket)
					this.handleUserList(socket);
					await this.handleDmList(socket, uid);
					this.nsp.emit("leaderboard-update", leaderBoard);
					this.nsp.emit("user-update", {
						userId: uid,
						userDisplayName: user.nickname,
						userProfileUrl: user.profileUrl,
						userStatus: 'online',
					});
				} else {
					this.logger.warn(`connect, then disconnect..`);
					throw new UnprocessableEntityException("Invalid connection.");
				}
			} else {
				this.logger.warn(`user not found.`);
				throw new UnauthorizedException("User not found.");
			}
		} catch (e) {
			this.logger.error(e);
			this.logger.log(`${JSON.stringify(e)}: ${e} : ${socket.id} invalid connection.disconnect socket.`);
			socket.disconnect();
		}
	}

	handleDisconnect(@ConnectedSocket() socket: Socket) {
		console.log(" \n");
		this.logger.warn(`${userList[socket?.data?.user?.uid]?.userDisplayName} : ${socket.id} socket disconnected`);
		this.logger.verbose(`${socket.id} <> ${userList[socket?.data?.user?.uid]?.socket?.id}`)
		if (socket.data?.user?.uid !== undefined) {
			if (userList[socket.data.user.uid]?.socket?.id === socket.id) {
				this.logger.debug(`${userList[socket.data.user.uid].userDisplayName} is now offline: ${socket.id}`);
				userList[socket.data.user.uid].socket = undefined;
				userList[socket.data.user.uid].status = 'offline';
				socket.broadcast.emit("user-update", {
					userId: socket.data.user.uid,
					userDisplayName: socket.data.user.nickname,
					userProfileUrl: socket.data.user.profileUrl,
					userStatus: 'offline',
				});
			}
			userList[socket.data.user.uid].isRefresh = false;
			userList[socket.data.user.uid].gameStatus = 'end';
		} else {
			this.logger.warn(`${socket.id} invalid connection. disconnect socket.`);
		}
		socket.data.roomList?.forEach((roomId: number) => {
			socket.leave(roomId.toString());
		});
	}

	@SubscribeMessage("server-log")
	ServerLog(
		@ConnectedSocket() socket: Socket,
		@MessageBody() msg: string
	) {
		this.logger.error(`${socket.id}: `, msg);
	}

	@SubscribeMessage("clear-data")
	ClearData(@ConnectedSocket() socket: Socket) {
		this.logger.log(`${socket.id} clear data`);
		this.nsp.emit("room-clear");
		this.nsp.emit("user-clear");
	}

	@SubscribeMessage("chat-logout")
	Logout(@ConnectedSocket() socket: Socket) {
		this.logger.warn(`${socket.id} logout`);
		userList[socket.data.user.uid].status = 'offline';
		this.nsp.emit("user-update", {
			userId: socket.data.user.uid,
			userDisplayName: socket.data.user.nickname,
			userProfileUrl: socket.data.user.profileUrl,
			userStatus: userList[socket.data.user.uid].status,
		});
	}

	@SubscribeMessage("user-change-info")
	async UserUpdateInfo(
		@ConnectedSocket() socket: Socket,
	) {
		const changedUser: User | null = await this.userService.getUserByUid(socket.data.user.uid);
		if (changedUser) {
			userList[socket.data.user.uid].userDisplayName = changedUser.nickname;
			userList[socket.data.user.uid].userUrl = changedUser.profileUrl;
			this.nsp.emit("user-update", {
				userId: changedUser.uid,
				userDisplayName: changedUser.nickname,
				userProfileUrl: changedUser.profileUrl,
				userStatus: userList[changedUser.uid].status,
			});
		}
	}

	@SubscribeMessage("user-update")
	UserUpdate(
		@ConnectedSocket() socket: Socket,
		@MessageBody() {
			status
		}: {
			status: userStatus;
		}
	) {
		if (socket.data?.user?.uid && userList[socket.data.user.uid]) {
			userList[socket.data.user.uid].status = status;
			this.nsp.emit("user-update", {
				userId: userList[socket.data.user.uid].userId,
				userDisplayName: userList[socket.data.user.uid].userDisplayName,
				userProfileUrl: userList[socket.data.user.uid].userUrl,
				userStatus: userList[socket.data.user.uid].status,
			});
		}
	}

	@SubscribeMessage("game-update")
	GameUpdate(
		@ConnectedSocket() socket: Socket,
		@MessageBody() {
			status
		}: {
			status: gameStatus
		}
	) {
		if (socket?.data?.user?.uid !== undefined && userList[socket?.data?.user?.uid]) {
			userList[socket.data.user.uid].gameStatus = status;
		}
	}

	@SubscribeMessage("game-status")
	GameStatus(
		@ConnectedSocket() socket: Socket,
		@MessageBody() {
			targetId
		}: {
			targetId: number
		}
	) {
		if (userList[targetId]) {
			return { status: userList[targetId].gameStatus };
		}
	}

	@SubscribeMessage("game-invite")
	GameInvite(
		@ConnectedSocket() socket: Socket,
		@MessageBody() {
			targetId
		}: {
			targetId: number
		}
	) {
		if (userList[targetId] === undefined) {
			return { status: 'ko', payload: '\nuser not found' };
		} else if (userList[targetId].socket === undefined) {
			return { status: 'ko', payload: '\nuser offline' };
		}
		this.nsp.to(userList[targetId].socket!.id).emit("game-invite", { userId: socket.data.user.uid });
		return { status: 'ok' };
	}

	@SubscribeMessage("game-invite-check")
	GameInviteCheck(
		@ConnectedSocket() socket: Socket,
		@MessageBody() {
			targetId,
			result
		}: {
			targetId: number;
			result: 'accept' | 'decline';
		}
	) {
		if (userList[targetId] && userList[targetId].socket && socket.data.user.uid !== undefined) {
			this.nsp.to(userList[targetId].socket!.id).emit("game-invite-check", { targetId: socket.data.user.uid, result });
		}
	}

	@SubscribeMessage("room-create")
	async RoomCreate(
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
		if (ROOM_COUNT >= MAX_ROOM_COUNT) {
			return { status: 'ko', payload: "\ntoo many rooms exists in live server" };
		}

		let tempRoomNumber: number | undefined = roomNumberQueue.shift();
		if (tempRoomNumber === undefined) {
			tempRoomNumber = ROOM_NUMBER;
			ROOM_NUMBER++;
		}

		const trimmedRoomName = roomName.trim();
		if (trimmedRoomName.length > 0 && trimmedRoomName.length <= 12) {
			const newRoomMembers: Record<number, RoomMember> = {};
			newRoomMembers[socket.data.user.uid] = {
				userRoomStatus: 'normal',
				userRoomPower: 'owner',
			};
			let tempRoomPass = '';
			if (roomPass !== '') {
				tempRoomPass = await bcrypt.hash(roomPass, 10)
			}
			roomList[tempRoomNumber] = {
				roomNumber: tempRoomNumber,
				roomName: trimmedRoomName,
				roomType: roomType,
				roomMembers: newRoomMembers,
				roomOwner: socket.data.user.uid,
				roomAdmins: [],
				bannedUsers: [],
				roomPass: tempRoomPass
			}
			socket.data.roomList.push(tempRoomNumber);
			socket.join(tempRoomNumber.toString());
			this.nsp.emit("room-list-update", {
				action: 'new',
				roomId: tempRoomNumber,
				roomName: trimmedRoomName,
				roomType
			});
			this.logger.debug(`room ${trimmedRoomName} created by ${userList[socket.data.user.uid].userDisplayName}`);
			this.nsp.to(socket.id).emit("room-join", {
				roomId: tempRoomNumber,
				roomName: trimmedRoomName,
				roomType,
				roomUserList: newRoomMembers,
				myPower: 'owner',
				status: 'ok'
			});
			ROOM_COUNT++;
		} else {
			return { status: 'ko', payload: "\nroom name must be 1 ~ 12 characters" };
		}
		return { status: 'ok' };
	}

	@SubscribeMessage("room-edit")
	async RoomEdit(
		@ConnectedSocket() socket: Socket,
		@MessageBody()
		{
			roomId,
			roomName,
			roomType,
			roomPass,
		}: {
			roomId: number;
			roomName: string;
			roomType: roomType;
			roomPass?: string;
		}) {
		if (roomList[roomId] === undefined) {
			console.log(roomList[roomId]);
			return { status: 'ko', payload: '\nroom not exists' };
		} else if (roomList[roomId].roomOwner !== socket.data.user.uid) {
			return { status: 'ko', payload: '\nonly owner can edit room' };
		}

		const trimmedRoomName = roomName.trim();
		if (trimmedRoomName == roomList[roomId].roomName
			&& roomType == roomList[roomId].roomType
			&& ((roomList[roomId].roomPass !== ''
				&& (await bcrypt.compare(roomPass, roomList[roomId].roomPass) === true
					|| roomPass === ''))
				|| (roomList[roomId].roomPass === ''
					&& roomPass === ''))) {
			return { status: 'ko', payload: '\nnothing changed' };
		}
		let tempRoomPass = roomList[roomId].roomPass;
		if (roomPass !== '') {
			tempRoomPass = await bcrypt.hash(roomPass, 10)
		}
		let tempRoomName = roomList[roomId].roomName;
		if (trimmedRoomName !== '') {
			tempRoomName = trimmedRoomName;
		}
		roomList[roomId].roomName = tempRoomName;
		roomList[roomId].roomType = roomType;
		roomList[roomId].roomPass = tempRoomPass;
		this.nsp.emit("room-list-update", {
			action: 'edit',
			roomId: roomId,
			roomName: tempRoomName,
			roomType: roomType
		});
		return { status: 'ok' };
	}


	@SubscribeMessage("room-join")
	async RoomJoin(
		@ConnectedSocket() socket: Socket,
		@MessageBody() {
			roomId,
			roomPass = '',
		}: {
			roomId: number;
			roomPass?: string;
		}) {
		if (roomList[roomId]) {
			if (roomList[roomId].bannedUsers.includes(socket.data.user?.uid)) {
				return ({ status: 'ko', payload: '\nbanned for 1 min' });
			}
			switch (roomList[roomId].roomType) {
				case 'protected': {
					if ((roomId !== 1 && await bcrypt.compare(roomPass, roomList[roomId].roomPass) === false)
						|| roomId === 1 && roomPass !== roomList[roomId].roomPass) {
						return ({ status: 'ko', payload: 'password incorrect' });
					}
				}
				case 'open': {
					const newMember: RoomMember = {
						userRoomStatus: 'normal',
						userRoomPower: 'member',
					}
					roomList[roomId].roomMembers[socket.data.user.uid] = newMember;
					this.logger.debug(`${userList[socket.data.user.uid].userDisplayName} join room ${roomList[roomId].roomName}: ${JSON.stringify(roomList[roomId].roomMembers[socket.data.user.uid])}`);
					socket.join(roomId.toString());
					socket.data.roomList.push(roomId);
					this.nsp.to(socket.id).emit("room-join", {
						roomId,
						roomName: roomList[roomId].roomName,
						roomType: roomList[roomId].roomType,
						roomUserList: roomList[roomId].roomMembers,
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
					return ({ status: 'ko', payload: '\nonly can join with invite' });
				}
				default: {
					return ({ status: 'ko', payload: '\nroom type error' });
				}
			}
		} else {
			this.nsp.to(socket.id).emit("logout");
			return ({ status: 'ko', payload: '\nroom not found' });
		}
	}

	@SubscribeMessage("room-leave")
	RoomLeave(
		@ConnectedSocket() socket: Socket,
		@MessageBody() {
			roomId,
		}: {
			roomId: number;
		}) {
		if (roomList[roomId] === undefined) {
			this.nsp.to(socket.id).emit("logout");
			return ({ status: 'error' });
		}
		this.logger.debug(`${socket.data.user.nickname} leave room ${roomList[roomId]?.roomName}`);
		if (this.handleDeleteRoomLogic(socket, roomId) === 'leave') {
			return ({ status: 'leave' });
		} else {
			return ({ status: 'delete' });
		}
	}

	handleDeleteRoomLogic(socket: Socket, roomId: number) {
		let action: 'delete' | 'leave' = 'leave'
		if (roomList[roomId] !== undefined) {
			const roomMemberCount = Object.entries(roomList[roomId]?.roomMembers).length;
			if (roomMemberCount <= 1) {
				this.nsp.emit("room-list-update", {
					action: 'delete',
					roomName: roomList[roomId].roomName,
					roomId,
					roomType: roomList[roomId].roomType
				});
				delete roomList[roomId];
				roomNumberQueue.push(roomId);
				ROOM_COUNT--;
				this.logger.debug(`Room ${roomId} deleted.\n`);
				action = 'delete';
			} else {
				socket.to(roomId.toString()).emit("room-in-action", {
					roomId,
					action: 'leave',
					targetId: socket.data.user.uid,
				});
				delete roomList[roomId].roomMembers[socket.data.user.uid];
				if (roomList[roomId].roomOwner === socket.data.user.uid) {
					let newOwner: number;

					if (roomList[roomId].roomAdmins.length === 0) {
						this.logger.debug(`Room ${roomId} has no admin.\n`);
						newOwner = Number(Object.keys(roomList[roomId].roomMembers)[0]);
						roomList[roomId].roomOwner = newOwner;
						roomList[roomId].roomMembers[newOwner].userRoomPower = 'owner';
					} else {
						this.logger.debug(`Room ${roomId} has admin.\n`);
						newOwner = roomList[roomId].roomAdmins[0];
						roomList[roomId].roomOwner = newOwner
						roomList[roomId].roomMembers[newOwner].userRoomPower = 'owner';
						roomList[roomId].roomAdmins.shift();
					}
					this.nsp.to(roomId.toString()).emit("room-in-action", {
						roomId,
						action: 'owner',
						targetId: newOwner,
					});
				} else if (roomList[roomId].roomAdmins.includes(socket.data.user.uid)) {
					roomList[roomId].roomAdmins = roomList[roomId].roomAdmins.filter((adminId) => { return adminId !== socket.data.user.uid; });
				}
			}
			socket.leave(roomId.toString());
			delete socket.data.roomList[roomId];
			return action;
		}
	}

	@SubscribeMessage("room-invite")
	async RoomInvite(
		@ConnectedSocket() socket: Socket,
		@MessageBody() {
			roomId,
			targetName,
		}: {
			roomId: number;
			targetName: string;
		}) {
		if (roomList[roomId] === undefined) {
			return ({ status: 'ko', payload: `\nroom not found in server` });
		}

		try {
			const targetUser: User | null = await this.userService.getUserByNickname(targetName);
			if (targetUser === null) {
				return ({ status: 'ko', payload: `\n ${targetName} user not found` });
			} else if (roomList[roomId].roomMembers[targetUser.uid] !== undefined) {
				return ({ status: 'ko', payload: `\n${targetName} already in this room` });
			} else if (roomList[roomId].bannedUsers.includes(targetUser.uid)) {
				return ({ status: 'ko', payload: `\n${targetName} banned for 1 min` });
			} else {
				const newMember: RoomMember = {
					userRoomStatus: 'normal',
					userRoomPower: 'member',
				}
				roomList[roomId].roomMembers[targetUser.uid] = newMember;
				const targetSocket: Socket | undefined = userList[targetUser.uid].socket;
				if (targetSocket === undefined) {
					throw new Error('target socket not found');
				}
				targetSocket.join(roomId.toString());
				targetSocket.data.roomList.push(roomId);
				this.nsp.to(targetSocket.id).emit("room-join", {
					roomId,
					roomName: roomList[roomId].roomName,
					roomType: roomList[roomId].roomType,
					roomUserList: roomList[roomId].roomMembers,
					myPower: 'member',
					status: 'ok',
					method: 'invite',
				});
				this.nsp.to(roomId.toString()).emit('room-in-action', {
					roomId,
					action: 'newMember',
					targetId: targetUser.uid,
				});
				return ({ status: 'ok' });
			}
		}
		catch (e) {
			return ({ status: 'ko', payload: `\n${targetName} ${e}` });
		}
	}

	@SubscribeMessage("user-block")
	async UserBlock(
		@ConnectedSocket() socket: Socket,
		@MessageBody() {
			targetId,
			doOrUndo
		}: {
			targetId: number,
			doOrUndo: boolean
		}) {
		const targetUser: User | null = await this.userService.getUserByUid(targetId);
		if (targetUser === null) {
			return ({ status: 'ko', payload: 'user not found' });
		}
		try {
			if (doOrUndo) {
				await this.userService.block(socket.data.user, targetUser);
				return ({ status: 'on' });
			} else {
				await this.userService.unblock(socket.data.user, targetUser);
				return ({ status: 'off' });
			}
		} catch (e) {
			console.log(e);
			return ({ status: 'ko', payload: `\n${e} ` });
		}
	}

	@SubscribeMessage("message")
	Message(
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
		} else if (roomList[roomId].roomMembers[socket.data.user.uid].userRoomStatus === 'mute') {
			return { status: 'ko', payload: 'mute 상태입니다.' };
		} else {
			this.nsp.to(String(roomId)).emit("message", {
				roomId,
				from: socket.data.user.uid,
				message,
			});
			return { status: 'ok' };
		}
	}

	@SubscribeMessage("room-in-action")
	RoomInAction(
		@ConnectedSocket() socket: Socket,
		@MessageBody() {
			roomId,
			action,
			targetId
		}: {
			roomId: number,
			action: 'mute' | 'ban' | 'kick' | 'admin',
			targetId: number
		}
	) {
		if (roomList[roomId] === undefined) {
			return { status: 'ko', payload: '\n방에 참여하세요\n 선택된 방이 없습니다.' };
		} else if (roomList[roomId].roomMembers[targetId] === undefined) {
			return { status: 'ko', payload: '\n해당 유저가 존재하지 않습니다.' };
		}

		switch (roomList[roomId].roomMembers[socket.data.user.uid].userRoomPower) {
			case 'owner': {
				if (action === 'admin') {
					switch (roomList[roomId].roomMembers[targetId].userRoomPower) {
						case 'admin': {
							return { status: 'ko', payload: '\n이미 admin 입니다.' };
						}
						case 'member': {
							roomList[roomId].roomMembers[targetId].userRoomPower = 'admin';
							roomList[roomId].roomAdmins.push(targetId);
							this.nsp.to(roomId.toString()).emit('room-in-action', {
								roomId,
								action,
								targetId,
							});
							return { status: 'ok' };
						}
						default: {
							return { status: 'ko', payload: '\nuserPower가 불확실합니다.' };
						}
					}
				}
			}
			case 'admin': {
				if (roomList[roomId].roomMembers[targetId].userRoomPower === 'owner') {
					return { status: 'ko', payload: '\nowner에게 영향을 줄 수 없습니다.' };
				}
				switch (action) {
					case 'admin': {
						return { status: 'ko', payload: '\n권한이 없습니다.' };
					}
					case 'mute': {
						if (roomList[roomId].roomMembers[targetId].userRoomStatus === 'mute') {
							return { status: 'ko', payload: '\n이미 mute 상태입니다.' };
						}
						roomList[roomId].roomMembers[targetId].userRoomStatus = 'mute';
						this.nsp.to(roomId.toString()).emit('room-in-action', {
							roomId,
							action,
							targetId,
						});
						setTimeout(() => {
							if (roomList[roomId]?.roomMembers[targetId] !== undefined
								&& roomList[roomId]?.roomMembers[targetId]?.userRoomStatus === 'mute') {
								roomList[roomId].roomMembers[targetId].userRoomStatus = 'normal';
								this.nsp.to(roomId.toString()).emit('room-in-action', {
									roomId,
									action: 'normal',
									targetId,
								});
							}
						}, 10000);
						break;
					}
					case 'ban': {
						if (roomList[roomId].bannedUsers.includes(targetId) === false) {
							this.logger.debug(`${socket.data.user.nickname} ban ${userList[targetId].userDisplayName} from ${roomList[roomId].roomName} `);
							roomList[roomId].bannedUsers.push(targetId);
							setTimeout(() => {
								if (roomList[roomId] !== undefined) {
									roomList[roomId].bannedUsers = roomList[roomId].bannedUsers.filter((userId) => userId !== targetId);
								}
							}, 60000);
						}
					}
					case 'kick': {
						delete roomList[roomId].roomMembers[targetId];
						if (roomList[roomId].roomAdmins.includes(targetId)) {
							roomList[roomId].roomAdmins = roomList[roomId].roomAdmins.filter((adminId) => adminId !== targetId);
						}
						this.nsp.to(roomId.toString()).emit('room-in-action', {
							roomId,
							action,
							targetId,
						});
						break;
					}
					default: {
						return { status: 'ko', payload: '\n정의되지 않은 행동입니다.' };
					}
				}
				break;
			}
			case 'member': {
				return { status: 'ko', payload: '\n권한이 없습니다.' };
			}
			default: {
				return { status: 'ko', payload: '\nuserPower가 불확실합니다.' };
			}
		}
		return { status: 'ok' };

	}

	@SubscribeMessage("message-dm")
	async MessageDM(
		@ConnectedSocket() socket: Socket,
		@MessageBody() {
			targetId,
			message,
		}: {
			targetId: number,
			message: string,
		}) {
		try {
			const newDM = new DirectMessage();
			newDM.senderId = socket.data.user.uid;
			newDM.receiverId = targetId;
			newDM.message = message;
			newDM.sender = await this.userService.getUserByUid(socket.data.user.uid);
			newDM.receiver = await this.userService.getUserByUid(targetId);
			const hasBlock = await this.databaseService.findBlockByUid(targetId, socket.data.user.uid);
			if (hasBlock !== null) {
				newDM.blockFromReceiver = true;
			}
			await this.databaseService.saveDM(newDM);
			this.nsp.to(socket.id).emit('message', {
				roomId: targetId,
				from: socket.data.user.uid,
				message,
			});
			if (userList[targetId]?.socket !== undefined) {
				this.nsp.to(userList[targetId]?.socket?.id!).emit('message', {
					roomId: socket.data.user.uid,
					from: socket.data.user.uid,
					message,
				});
			}
			return { status: 'ok' };
		} catch (error) {
			this.logger.error(error);
		}
		return { status: 'ko' };
	}

	@SubscribeMessage("dm-room-create")
	async DMRoomCreate(
		@ConnectedSocket() socket: Socket,
		@MessageBody() {
			targetId,
		}: {
			targetId: number,
		}) {
		try {
			// const myDmList = await this.databaseService.findDMSenderAndReceiver(socket.data.user.uid, targetId);
			// const targetDmlist = await this.databaseService.findDMSenderAndReceiver(targetId, socket.data.user.uid);
			// console.log(myDmList);
			// console.log(`---------------------------------------\n`);
			// console.log(targetDmlist);
			const dmUserList: Record<number, RoomMember> = {};
			dmUserList[socket.data.user.uid] = {
				userRoomStatus: 'normal',
				userRoomPower: 'member'
			}
			dmUserList[targetId] = {
				userRoomStatus: 'normal',
				userRoomPower: 'member'
			}
			this.nsp.to(socket.id).emit('room-join', {
				roomId: targetId,
				roomName: 'DM',
				roomType: 'dm',
				roomUserList: dmUserList,
				myPower: 'member',
				status: 'ok',
			});
			if (userList[targetId]?.socket !== undefined) {
				this.nsp.to(userList[targetId]?.socket?.id!).emit('room-join', {
					roomId: socket.data.user.uid,
					roomName: 'DM',
					roomType: 'dm',
					roomUserList: dmUserList,
					myPower: 'member',
					status: 'ok',
					method: 'invite'
				});
			}
			return { status: 'ok' };
		} catch (e) {
			this.logger.error(`dm - room - create ${e}`);
		}
		return { status: 'ko' };
	}

	@SubscribeMessage("server-room-list")
	handleServerRoomList(@ConnectedSocket() socket: Socket) {
		this.logger.verbose("server-room-list");
		Object.entries(roomList).forEach(([roomId, roomInfo]) => {
			console.log(`\n${roomInfo.roomName} : ${roomId}: ${roomInfo.roomType} ${roomInfo.roomPass} `);
			console.log(`\towner: ${userList[roomInfo.roomOwner].userDisplayName}: ${roomInfo.roomOwner} `);
			console.log(`\tadmins: ${roomInfo.roomAdmins.map((adminId) => userList[adminId].userDisplayName).join(', ')} `);
			Object.entries(roomInfo.roomMembers).forEach(([uid, memberInfo]) => {
				console.log(`\t${userList[uid].userDisplayName}: ${uid}: \t\t${memberInfo.userRoomStatus} ${memberInfo.userRoomPower} `);
			});
		});
	}

	@SubscribeMessage("server-user-list")
	handleServerUserList(@ConnectedSocket() socket: Socket) {
		this.logger.verbose("server-user-list");
		Object.entries(userList).forEach(([uid, userInfo]) => {
			console.log(`\n${userInfo.userDisplayName}: ${uid}: ${userInfo.status} `);
		});
	}

	handleRoomList(socket: Socket) {
		const tempRoomList: Record<number, ClientRoomListDto> = {};

		for (const [roomId, roomInfo] of Object.entries(roomList)) {
			if (roomInfo.roomMembers[socket?.data?.user?.uid] !== undefined) {
				socket.join(roomId.toString());
				tempRoomList[roomId] = {
					roomName: roomInfo.roomName,
					roomType: roomInfo.roomType,
					isJoined: true,
					detail: {
						userList: roomInfo.roomMembers,
						messageList: [],
						myRoomStatus: roomInfo.roomMembers[socket.data.user.uid].userRoomStatus,
						myRoomPower: roomInfo.roomMembers[socket.data.user.uid].userRoomPower,
					}
				};
				// } else if (roomInfo.roomType === 'private') {
			} else {
				tempRoomList[roomId] = {
					roomName: roomInfo.roomName,
					roomType: roomInfo.roomType,
					isJoined: false,
				};
			}
		}
		this.nsp.to(socket.id).emit("room-list", tempRoomList);
	}

	handleUserList(socket: Socket) {
		const tempUserList: Record<number, ClientUserDto> = {};

		try {
			for (const [uid, userInfo] of Object.entries(userList)) {
				if (Number(uid) <= 2) {
					tempUserList[uid] = {
						userDisplayName: userInfo.userDisplayName || 'test user',
						userProfileUrl: userInfo.userUrl || 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/42_Logo.svg/2048px-42_Logo.svg.png',
						userStatus: userInfo.status,
					}
				} else {
					tempUserList[uid] = {
						userDisplayName: userInfo.userDisplayName,
						userProfileUrl: userInfo.userUrl,
						userStatus: userInfo.status,
					};
				}
			}
		} catch (error) {
			this.logger.error(`catch-error: handleUserList - ${error}: `, error);
		}
		this.nsp.to(socket.id).emit("user-list", tempUserList);
	}

	async handleBlockList(socket: Socket) {
		const blockList = await this.userService.findAllBlock(socket.data.user);

		const tempUser: Record<number, boolean> = {};
		try {
			blockList?.forEach((blockId) => {
				tempUser[blockId.targetToBlockId] = true;
			})
		} catch (e) {
			this.logger.error(`handleBlockList - ${e} `);
		}
		this.nsp.to(socket.id).emit("block-list", tempUser);
	}

	async handleFollowList(socket: Socket, uid: number) {
		try {
			const userFollow = await this.userService.getFollowingUserInfo(uid);

			const tempFollowList: Record<number, ClientUserDto> = {};
			userFollow?.map((targetId) => {
				tempFollowList[targetId.uid] = {
					userDisplayName: targetId.nickname,
					userProfileUrl: targetId.profileUrl,
					userStatus: userList[targetId.uid]?.status || 'offline',
				};
			});
			this.nsp.to(socket.id).emit("follow-list", tempFollowList);
		} catch (e) {
			this.logger.error(`handleFollowList - ${e} `);
		}
	}

	async handleDmList(socket: Socket, uid: number) {

		try {
			const allDmList = await this.databaseService.findAllDM(uid);
			const dmListQueue = new Set<number>();
			allDmList?.forEach((dm) => {
				dmListQueue.add(dm.senderId);
				dmListQueue.add(dm.receiverId);
			});
			delete dmListQueue[uid];

			const resDmUserList: Record<number, ClientUserDto> = {};
			for (const uid of dmListQueue) {
				if (userList[uid] === undefined) {
					const targetUser = await this.userService.getUserByUid(uid);
					if (targetUser === null) continue;
					resDmUserList[uid] = {
						userDisplayName: targetUser.nickname,
						userProfileUrl: targetUser.profileUrl,
						userStatus: 'offline'
					};
				} else {
					resDmUserList[uid] = {
						userDisplayName: userList[uid].userDisplayName || 'undefined userName',
						userProfileUrl: userList[uid].userUrl || "https://cdn.intra.42.fr/users/d8e2bd2560244d587d621f2cdf808be4/polarbear.gif",
						userStatus: userList[uid].status || 'offline'
					};
				}
			};
			this.nsp.to(socket.id).emit("dm-list", resDmUserList, allDmList);
		} catch (error) {
			this.logger.error(`handleDmList - ${error} `);
		}
	}
}
