type userStatus = 'online' | 'offline' | 'inGame';
type gameStatus = 'ready' | 'playing' | 'end';
type userRoomStatus = 'normal' | 'mute';
type userRoomPower = 'owner' | 'admin' | 'member';

type dmDto = {
	did: number,
	senderId: number,
	receiverId: number,
	message: string | null,
	blockFromReceiver: boolean,
	time?: string,
};

type userDto = {
	[key: number]: {
		userDisplayName: string;
		userProfileUrl: string;
		userStatus: userStatus;
		dmStatus?: 'unread' | 'read';
	}
}
type userSimpleDto = {
	[key: number]: {
		blocked: boolean;
	}
}

type roomMessageDto = {
	userId: number;
	userName: string;
	message: string;
	isMe: boolean;
	number: number;
	date?: string;
}

type userInRoomListDto = {
	[key: number]: {
		userRoomStatus: 'normal' | 'mute';
		userRoomPower: userRoomPower
	}
}

type roomDetailDto = {
	userList: userInRoomListDto,
	messageList: roomMessageDto[],
	myRoomStatus: 'normal' | 'mute';
	myRoomPower: userRoomPower
}

type roomListDto = {
	[key: number]: {
		roomName: string
		roomType: 'open' | 'protected' | 'private' | 'dm';
		isJoined: boolean;
		detail?: roomDetailDto;
	}
}

interface leaderboardDto {
	nickname: string;
	elo: number;
	winRate: number;
	winGameCount: number;
	lostGameCount: number;
	totalGameCount: number;
}

export type { userDto, userSimpleDto, roomDetailDto, roomMessageDto, roomListDto, userInRoomListDto, userStatus, userRoomStatus, userRoomPower, dmDto, gameStatus, leaderboardDto };
