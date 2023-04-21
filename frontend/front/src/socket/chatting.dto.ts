import { type } from 'os';

enum IUserStatus {
	offline,
	online,
	inGame,
}

enum IInRoomStatus {
	normal,
	mute,
	ban,
	kick,
}

enum IRoomType {
	dm,
	open,
	protected,
	private,
}

enum IRoomPower {
	owner,
	admin,
	member,
}

type userGlobalAttributes = {
	userName: string; // or user unique id
	userProfile: string;
	userStatus: IUserStatus;
	userRoomPower: IRoomPower;
}

type userRoomAttributes = {
	userDefaultInfo: userGlobalAttributes;
	userInRoomStatus: IInRoomStatus;
}

type userRoomMap = {
	[key: string]: userRoomAttributes;
}

type messageAttributes = {
	userName: string;
	message: string;
	isMe: boolean;
}

type roomDefault = {
	roomName: string;
	roomType: IRoomType;
}

type roomAttributes = {
	roomDefaultInfo: roomDefault;
	roomUserList: userRoomMap;
	roomMessageList: messageAttributes[];
	myRoomStatus: IInRoomStatus;
}

type perUserItem = {
	userList: userGlobalAttributes[];
	roomList: roomDefault[];
	myRoomList: roomAttributes[];
}

export type { perUserItem };

export const userItem: perUserItem = {
	userList: [],
	roomList: [],
	myRoomList: [],
};
