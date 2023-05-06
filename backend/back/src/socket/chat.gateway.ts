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
import { UserFollow } from "src/database/entity/user-follow.entity";
import { UserBlock } from "src/database/entity/user-block.entity";
import { UserService } from "src/user/user.service";
import * as bcrypt from 'bcrypt';


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
		status: 'offline',
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
			}
		},
		roomOwner: 0,
		roomAdmins: [1],
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
					this.logger.debug(`${socket.data.user.nickname} first connected.`);
					userList[uid] = {
						socket: socket,
						status: 'online',
						blockList: [],
						followList: [],
						userId: user.uid,
						userDisplayName: user.nickname.split('#', 2)[0],
						userUrl: user.profileUrl,
						isRefresh: false,
					};
					try {
						user?.blockedUsers?.map((blockedUser) => {
							console.log(blockedUser?.targetToBlockId);
							userList[uid].blockList?.push(blockedUser?.targetToBlockId);
						});
					} catch (e) {
						this.logger.warn("in db, blockedUsers is empty");
					}
					try {
						user?.followings?.map((followUser) => {
							console.log(followUser?.targetToFollowId);
							userList[uid].followList?.push(followUser?.targetToFollowId);
						});
					} catch (e) {
						this.logger.warn("in db, blockedUsers is empty");
					}
				} else {
					this.logger.debug(`${socket.data.user.nickname} refreshed.`);
					userList[socket.data.user.uid].status = 'online';
					userList[socket.data.user.uid].isRefresh = true;
					userList[socket.data.user.uid].socket?.disconnect();
					userList[socket.data.user.uid].socket = socket;
				}
				this.logger.verbose(`${userList[socket.data.user.uid].userDisplayName} is now online`);
				this.nsp.to(socket.id).emit("block-list", this.handleBlockList(socket));
				this.nsp.to(socket.id).emit("follow-list", this.handleFollowList(socket));
				this.nsp.to(socket.id).emit("dm-list", this.handleDmList(socket));
				this.nsp.to(socket.id).emit("user-list", this.handleUserList(socket));
				this.nsp.to(socket.id).emit("room-list", this.handleRoomList(socket));

				socket.broadcast.emit("user-update", {
					userId: socket.data.user.uid,
					userDisplayName: socket.data.user.nickname.split('#', 2)[0],
					userProfileUrl: socket.data.user.profileUrl,
					userStatus: 'online',
				});
			} else {
				throw new UnauthorizedException("User not found.");
			}
		} catch (e) {
			this.logger.log(`${socket.id} invalid connection. disconnect socket.`);
			socket.disconnect();
		}
	}

	handleDeleteRoomLogic(socket: Socket, roomId: number) {
		let roomMemberCount = 0;
		let action: 'delete' | 'leave' = 'leave'
		if (roomList[roomId] !== undefined) {
			Object.entries(roomList[roomId]?.roomMembers).forEach(() => {
				roomMemberCount++;
			});
			if (roomMemberCount <= 1) {
				this.nsp.emit("room-list-update", {
					action: 'delete',
					roomName: roomList[roomId].roomName,
					roomId,
					roomType: roomList[roomId].roomType
				});
				delete roomList[roomId];
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

					if (roomList[roomId]?.roomAdmins[0] === undefined) {
						newOwner = Number(Object.keys(roomList[roomId].roomMembers)[0]);
						roomList[roomId].roomOwner = newOwner;
						roomList[roomId].roomMembers[newOwner].userRoomPower = 'owner';
					} else {
						newOwner = roomList[roomId]?.roomAdmins[0];
						roomList[roomId].roomOwner = newOwner
						roomList[roomId].roomMembers[newOwner].userRoomPower = 'owner';
						roomList[roomId].roomAdmins.shift();
					}
					this.nsp.to(roomId.toString()).emit("room-in-action", {
						roomId,
						action: 'owner',
						targetId: newOwner,
					});
				}
			}
			socket.to(roomId.toString()).emit('message', {
				roomId,
				from: socket.data.user.uid,
				message: `${userList[socket.data.user.uid].userDisplayName} left this room`,
			});
			socket.leave(roomId.toString());
			delete socket.data.roomList[roomId];
			return action;
		}
	}

	handleDisconnect(@ConnectedSocket() socket: Socket) {
		this.logger.log(`${userList[socket?.data?.user?.uid]?.userDisplayName} : ${socket.id} socket disconnected`);
		socket.data.roomList?.forEach((roomId: number) => {
			socket.leave(roomId.toString());
		});
		if (socket.data?.user?.uid !== undefined && userList[socket.data.user.uid]?.socket?.id! === socket.id &&
			userList[socket.data.user.uid]?.isRefresh === false) {
			this.logger.verbose(`${userList[socket.data.user.uid].userDisplayName} is now offline`);
			userList[socket.data.user.uid].status = 'offline';
			userList[socket.data.user.uid].socket = undefined;
			socket.broadcast.emit("user-update", {
				userId: socket.data.user.uid,
				userDisplayName: socket.data.user.nickname.split('#', 2)[0],
				userProfileUrl: socket.data.user.profileUrl,
				userStatus: userList[socket.data.user.uid].status,
			});
		}
		socket.data.user = undefined;
		socket.data.roomList = undefined;
	}

	@SubscribeMessage("clear-data")
	ClearData(@ConnectedSocket() socket: Socket) {
		this.logger.log(`${socket.id} clear data`);
		this.nsp.emit("room-clear");
		this.nsp.emit("user-clear");
	}

	@SubscribeMessage("chat-logout")
	Logout(@ConnectedSocket() socket: Socket) {
		this.logger.log(`${socket.id} logout`);
		userList[socket.data.user.uid].status = 'offline';
		this.nsp.emit("user-update", {
			userId: socket.data.user.uid,
			userDisplayName: socket.data.user.nickname.split('#', 2)[0],
			userProfileUrl: socket.data.user.profileUrl,
			userStatus: userList[socket.data.user.uid].status,
		});
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
		const saltRound = 10;
		const cryptedPassword = await bcrypt.hash(roomPass, saltRound)
		const trimmedRoomName = roomName.trim();
		if (trimmedRoomName.length > 0 && trimmedRoomName.length <= 12) {
			// const newMember: RoomMember = {
			// 	userRoomStatus: 'normal',
			// 	userRoomPower: 'owner',
			// };
			const newRoomMembers: Record<number, RoomMember> = {};
			newRoomMembers[socket.data.user.uid] = {
				userRoomStatus: 'normal',
				userRoomPower: 'owner',
			};
			roomList[ROOM_NUMBER] = {
				roomNumber: ROOM_NUMBER,
				roomName: trimmedRoomName,
				roomType: roomType,
				roomMembers: newRoomMembers,
				roomOwner: socket.data.user.uid,
				roomAdmins: [],
				bannedUsers: [],
				roomPass: cryptedPassword ?? ''
			}
			socket.data.roomList.push(ROOM_NUMBER);
			socket.join(ROOM_NUMBER.toString());
			if (roomType !== 'private') {
				this.nsp.emit("room-list-update", {
					action: 'new',
					roomId: ROOM_NUMBER,
					roomName: trimmedRoomName,
					roomType
				});
			}
			this.logger.debug(`room ${trimmedRoomName} created by ${userList[socket.data.user.uid].userDisplayName}`);
			this.nsp.to(socket.id).emit("room-join", {
				roomId: ROOM_NUMBER,
				roomName: trimmedRoomName,
				roomType,
				userList: newRoomMembers,
				myPower: 'owner',
				status: 'ok'
			});
			ROOM_NUMBER++;
		} else {
			return { status: 'ko' };
		}
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
			switch (roomList[roomId].roomType) {
				case 'protected': {
					if (roomId !== 1 && await bcrypt.compare(roomPass, roomList[roomId].roomPass) === false) {
						return ({ status: 'ko', payload: 'password incorrect' });
					} else if (roomId === 1 && roomPass !== roomList[roomId].roomPass) {
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
						userList: roomList[roomId].roomMembers,
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
	RoomLeave(
		@ConnectedSocket() socket: Socket,
		@MessageBody() {
			roomId,
		}: {
			roomId: number;
		}) {
		this.logger.debug(`${socket.data.user.nickname} leave room ${roomList[roomId].roomName}`);
		if (this.handleDeleteRoomLogic(socket, roomId) === 'leave') {
			return ({ status: 'leave' });
		} else {
			return ({ status: 'delete' });
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
		switch (roomList[roomId].roomMembers[socket.data.user.uid].userRoomPower) {
			case 'owner': {
				if (action === 'admin') {
					switch (roomList[roomId].roomMembers[targetId].userRoomPower) {
						case 'admin': {
							return { status: 'ko', payload: '\n이미 admin 입니다.' };
						}
						case 'member': {
							roomList[roomId].roomMembers[targetId].userRoomPower = 'admin';
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
				switch (action) {
					case 'admin': {
						return { status: 'ko', payload: '\n권한이 없습니다.' };
					}
					case 'mute': {

						// setTimeout(() => {
						// 		const newUserList: chatType.userInRoomListDto = roomList[roomId].detail?.userList!;
						// 		newUserList[targetId] = { ...newUserList[targetId], userRoomStatus: 'normal' };
						// 		socket.setNewDetailToNewRoom({ roomList, setRoomList, roomId, newUserList }, 'normal');
						// 	}, 10000);
						break;
					}
					case 'ban': {
						break;
					}
					case 'kick': {
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
			} else if (roomInfo.roomType !== 'private') {
				tempRoomList[roomId] = {
					roomName: roomInfo.roomName,
					roomType: roomInfo.roomType,
				};
			}
		}
		return tempRoomList;
	}

	handleUserList(socket: Socket) {
		const tempUserList: Record<number, ClientUserDto> = {};
		for (const [uid, userInfo] of Object.entries(userList)) {
			if (Number(uid) <= 2) {
				tempUserList[uid] = {
					userDisplayName: userInfo.userDisplayName || 'test user',
					userProfileUrl: userInfo.userUrl || 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/42_Logo.svg/2048px-42_Logo.svg.png',
					userStatus: userInfo.status,
				}
			} else {
				tempUserList[uid] = {
					userDisplayName: userInfo.socket?.data.user.nickname.split('#', 2)[0],
					userProfileUrl: userInfo.socket?.data.user.profileUrl,
					userStatus: userInfo.status,
				};
			}
		}
		return tempUserList;
	}

	handleBlockList(socket: Socket) {
		const tempUser: Record<number, boolean> = {};
		try {
			userList[socket.data.user.uid].blockList.forEach((blockId) => {
				tempUser[blockId] = true;
			})
		} catch (e) {
			this.logger.error(`handleBlockList - ${e}`);
		}
		return tempUser;
	}

	handleFollowList(socket: Socket) {
		const tempFollowList: Record<number, ClientUserDto> = {};
		try {
			socket?.data?.user?.followings?.forEach((targetId: UserFollow) => {
				tempFollowList[targetId.targetToFollowId] = {
					userDisplayName: targetId.fromUser.nickname,
					userProfileUrl: targetId.fromUser.profileUrl,
					userStatus: userList[targetId.targetToFollowId].status,
				};
			});
		} catch (e) {
			this.logger.error(`handleFollowList - ${e}`);
		}
		return tempFollowList;
	}

	handleDmList(socket: Socket) {
		const tempDmList: Record<number, ClientUserDto> = {};
		return tempDmList;
	}
}
