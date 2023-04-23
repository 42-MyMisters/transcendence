type roomDefaultInfoAttributes = {
	roomName: string;
	roomType: 'open' | 'protected' | 'private' | 'dm';
}

type roomAttributes = {
	roomDefaultInfo: roomDefaultInfoAttributes;
	roomUserList: {
		[key: string]: {
			userDefaultInfo: {
				userName: string; // or user unique id
				userProfile: string;
				userStatus: 'online' | 'offline' | 'inGame';
			};
			userInRoomStatus: 'normal' | 'mute' | 'ban' | 'kick';
			userRoomPower: 'owner' | 'admin' | 'member';
		}
	},
	roomMessageList: {
		userName: string;
		message: string;
		isMe: boolean;
		date?: string;
	}[],
	myRoomStatus: 'normal' | 'mute' | 'ban' | 'kick',
	userNameHistory?: {
		[key: string]: {
			userName: string;
			userProfile: string;
		};
	},
}

type socketUserItemDto = {
	userList: {
		userName: string; // or user unique id
		userProfile: string;
		userStatus: 'online' | 'offline' | 'inGame';
	}[],
	roomList: roomDefaultInfoAttributes[],
	joinRoomList: roomAttributes[];
}

export type { socketUserItemDto };

export const userItem: socketUserItemDto = {
	userList: [],
	roomList: [],
	joinRoomList: [],
};
