
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
	open,
	protected,
	private,
	dm,
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
}

type userRoomAttributes = {
	userDefaultInfo: userGlobalAttributes;
	userInRoomStatus: IInRoomStatus;
	userRoomPower: IRoomPower;
}

type userRoomMap = {
	[key: string]: userRoomAttributes;
}

type userNameHistory = {
	[key: string]: string;
}

type messageAttributes = {
	userName: string;
	message: string;
	isMe: boolean;
}

type roomDefaultInfo = {
	roomName: string;
	roomType: IRoomType;
}

type roomAttributes = {
	roomDefaultInfo: roomDefaultInfo;
	roomUserList: userRoomMap;
	roomMessageList: messageAttributes[];
	userNameHistory: userNameHistory;
	myRoomStatus: IInRoomStatus;
}

type perUserItem = {
	userList: userGlobalAttributes[];
	roomList: roomDefaultInfo[];
	joinRoomList: roomAttributes[];
}

export type { perUserItem };

export const userItem: perUserItem = {
	userList: [],
	roomList: [],
	joinRoomList: [],
};
