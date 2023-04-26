type userDto = {
	[key: number]: {
		userDisplayName: string;
		userProfileUrl: string;
		userStatus: 'online' | 'offline' | 'inGame';
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
	number: number;
	date?: string;
}

type userInRoomListDto = {
	[key: number]: {
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
	// [key: number]: {
	[key: number]: {
		roomName: string
		roomType: 'open' | 'protected' | 'private';
		isJoined?: boolean;
		// kickList?: number[];
		detail?: roomDetailDto;
	}
}

export type { userDto, userSimpleDto, roomDetailDto, roomMessageDto, roomListDto, userInRoomListDto };
