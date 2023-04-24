type userDto = {
	[key: number]: {
		userDisplayName: string;
		userProfileUrl: string;
		userStatus: 'online' | 'offline' | 'inGame';
	}
}

type roomMessageDto = {
	userId: number;
	message: string;
	isMe: boolean;
	date?: string;
}

type joinRoomDto = {
	userList: {
		[key: number]: {
			userRoomStatus: 'normal' | 'mute' | 'ban' | 'kick';
			userRoomPower: 'owner' | 'admin' | 'member';
		}
	},
	messageList: roomMessageDto[],
	// myRoomStatus: 'normal' | 'mute' | 'ban' | 'kick',
	userNameHistory?: userDto;
}

type roomDto = {
	[key: string]: {
		roomType: 'open' | 'protected' | 'private' | 'dm';
		isJoined: boolean;
		joinDetail?: joinRoomDto;
	}
}

export type { userDto, roomDto, joinRoomDto, roomMessageDto };
