type roomDto = {
	roomName: string;
	roomType: 'open' | 'protected' | 'private' | 'dm';
}

type roomMessageDto = {
	from: number;
	message: string;
	isMe: boolean;
	date?: string;
}

type userDto = {
	userId: number;
	userDisplayName: string;
	userProfileUrl: string;
	userStatus: 'online' | 'offline' | 'inGame';
}

type joinRoomDto = {
	info: roomDto;
	userList: {
		[key: number]: {
			userInfo: userDto;
			userRoomStatus: 'normal' | 'mute' | 'ban' | 'kick';
			userRoomPower: 'owner' | 'admin' | 'member';
		}
	},
	messageList: roomMessageDto[],
	// myRoomStatus: 'normal' | 'mute' | 'ban' | 'kick',
	userNameHistory?: {
		[key: number]: {
			userInfo: userDto;
		};
	},
}

export type { userDto, roomDto, joinRoomDto, roomMessageDto };
