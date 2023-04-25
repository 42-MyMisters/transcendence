type userDto = {
	[key: number]: {
		userDisplayName: string;
		userProfileUrl: string;
		userStatus: 'online' | 'offline' | 'inGame';
		hasDmHistory: boolean;
	}
}
type userSimpleDto = {
	[key: number]: {
		blocked: boolean;
	}
}

type roomMessageDto = {
	userId: number;
	message: string;
	isMe: boolean;
	date?: string;
}

type userInRoomListDto = {
	[key: number]: {
		userDisplayName: string;
		userRoomStatus: 'normal' | 'mute' | 'ban' | 'kick';
		userRoomPower: 'owner' | 'admin' | 'member';
	}
}

type roomDetailDto = {
	userList: userInRoomListDto,
	messageList: roomMessageDto[],
	myRoomStatus: 'normal' | 'mute' | 'ban' | 'kick',
	myRoomPower: 'owner' | 'admin' | 'member';
}

type roomListDto = {
	[key: number]: {
		roomName: string
		roomType: 'open' | 'protected' | 'private';
		isJoined: boolean;
		// kickList?: number[];
		detail?: roomDetailDto;
	}
}

export type { userDto, userSimpleDto, roomDetailDto, roomMessageDto, roomListDto, userInRoomListDto };
