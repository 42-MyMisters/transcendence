import { atom, createStore } from "jotai";

enum IUserStatus {
	offline,
	online,
	ingame,
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
};

type userRoomAttributes = {
	userInfo: userGlobalAttributes;
	userInRoomStatus: IInRoomStatus;
	userRoomPower: IRoomPower;
};

type messageAttributes = {
	userName: string;
	message: string;
	isMe: boolean;
};

type roomAttributes = {
	roomName: string;
	roomType: IRoomType;
	roomUsers: userRoomAttributes;
	roomMessages: messageAttributes[];
	myRoomStatus: IInRoomStatus;
};



export const socketFirstTouch = atom<boolean>(false);
export const hasLogin = atom<boolean>(false);

// export const storeSocketInit = createStore();

// storeSocketInit.set(socketFirstTouch, false);

// export const readWriteAtom = atom(
// 	(get) => {
// 		get(socketFirstTouch)
// 	},
// 	(get, set, newState: boolean) => {
// 		set(socketFirstTouch, newState)
// 	}
// )
