type roomDto = {
	roomName: string;
	roomType: 'open' | 'protected' | 'private' | 'dm';
}

type roomMessageDto = {
	from: string;
	message: string;
	isMe: boolean;
	date?: string;
}

type userDto = {
	userName: string;
	userProfile: string;
	userStatus: 'online' | 'offline' | 'inGame';
}

type joinRoomDto = {
	info: roomDto;
	userList: {
		[key: string]: {
			userInfo: userDto;
			userRoomStatus: 'normal' | 'mute' | 'ban' | 'kick';
			userRoomPower: 'owner' | 'admin' | 'member';
		}
	},
	messageList: roomMessageDto[],
	myRoomStatus: 'normal' | 'mute' | 'ban' | 'kick',
	userNameHistory?: {
		[key: string]: {
			userInfo: userDto;
		};
	},
}

export const userList: userDto[] = [];
export const roomList: roomDto[] = [];
export const joinRoomList: joinRoomDto[] = [];

export type { userDto, roomDto, joinRoomDto, roomMessageDto };
