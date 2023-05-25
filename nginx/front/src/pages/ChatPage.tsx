import BackGround from "../components/BackGround";
import ChatArea from "../components/ChatPage/ChatArea";
import ChatRoomList from "../components/ChatPage/ChatRoomList";
import ChatRoomUserList from "../components/ChatPage/ChatRoomUserList";
import ChatUserList from "../components/ChatPage/ChatUserList";
import TopBar from "../components/TopBar";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
	gameInviteModalAtom,
	inviteModalAtom,
	passwordInputModalAtom,
	roomModalAtom,
	userInfoModalAtom
} from "../components/atom/ModalAtom";

import { useNavigate } from "react-router-dom";
import PasswordModal from "../components/ChatPage/PasswordModal";
import RoomInviteModal from "../components/ChatPage/RoomInviteModal";
import RoomModal from "../components/ChatPage/RoomModal";
import UserInfoModal from "../components/ChatPage/UserInfoModal";
import GameInviteModal from "../components/GamePage/GameInviteModal";
import * as chatAtom from "../components/atom/ChatAtom";
import { refreshTokenAtom } from "../components/atom/LoginAtom";
import { TFAAtom, UserAtom } from "../components/atom/UserAtom";
import { GetMyInfo, LogOut, RefreshToken } from "../event/api.request";
import { AdminLogPrinter } from "../event/event.util";
import * as socket from "../socket/chat.socket";

export default function ChatPage() {
	const userInfoModal = useAtomValue(userInfoModalAtom);
	const roomModal = useAtomValue(roomModalAtom);
	const inviteModal = useAtomValue(inviteModalAtom);
	const pwInputModal = useAtomValue(passwordInputModalAtom);
	const [userInfo, setUserInfo] = useAtom(UserAtom);
	const setIsFirstLogin = useSetAtom(chatAtom.isFirstLoginAtom);
	const setHasLogin = useSetAtom(chatAtom.hasLoginAtom);
	const roomList = useAtomValue(chatAtom.roomListAtom);
	const userList = useAtomValue(chatAtom.userListAtom);
	const dmHistoryList = useAtomValue(chatAtom.dmHistoryListAtom);
	const followingList = useAtomValue(chatAtom.followingListAtom);
	const blockList = useAtomValue(chatAtom.blockListAtom);
	const socketState = useAtomValue(chatAtom.socketStateAtom);
	const setRefreshToken = useSetAtom(refreshTokenAtom);
	const gameInviteModal = useAtomValue(gameInviteModalAtom);
	const adminConsole = useAtomValue(chatAtom.adminConsoleAtom);
	const setTfa = useSetAtom(TFAAtom);
	const navigate = useNavigate();

	const getRoomList = () => {
		AdminLogPrinter(adminConsole, "\n\ngetRoomList");
		Object.entries(roomList).forEach(([key, value]) => {
			if (value.detail !== undefined) {
				AdminLogPrinter(adminConsole, `\n[ ${value.roomName} : ${key}] - ${value.roomType}`);
				Object.entries(value.detail).forEach(([key, value]) => {
					if (key === "userList") {
						Object.entries(value).forEach(([key, value]) => {
							AdminLogPrinter(adminConsole, `uid: ${key}, value: ${JSON.stringify(value)}`);
						});
					} else {
						AdminLogPrinter(adminConsole, `key: ${key}, value: ${JSON.stringify(value)}`);
					}
				});
			} else {
				AdminLogPrinter(adminConsole, `[ ${value.roomName} ] \nvalue: ${JSON.stringify(value)}`);
			}
		});
	};

	const getUserList = () => {
		AdminLogPrinter(adminConsole, "\n\ngetUserList");
		Object.entries(userList).forEach(([key, value]) => {
			AdminLogPrinter(adminConsole, `[ ${value.userDisplayName} ]\nkey: ${key}, value: ${JSON.stringify(value)}`);
		});
	};

	const getDMList = () => {
		AdminLogPrinter(adminConsole, "\n\ngetDmHitoryList");
		Object.entries(dmHistoryList).forEach(([key, value]) => {
			AdminLogPrinter(adminConsole, `[ ${value.userDisplayName} ]\nkey: ${key}, value: ${JSON.stringify(value)}`);
		});
	};

	const getFollowingList = () => {
		AdminLogPrinter(adminConsole, `\n\ngetFollowingList`);
		Object.entries(followingList).forEach(([key, value]) => {
			AdminLogPrinter(adminConsole, `[ ${value.userDisplayName} ]\nkey: ${key}, value: ${JSON.stringify(value)}`);
		});
	};

	const showSocketState = () => {
		AdminLogPrinter(adminConsole, `socket state: ${socketState}: ${socket.socket.id}`);
	};


	const getBlockList = () => {
		AdminLogPrinter(adminConsole, `\n\ngetBlockList`);
		Object.entries(blockList).forEach(([key, value]) => {
			AdminLogPrinter(adminConsole, `[ ${userList[Number(key)]?.userDisplayName} ]\nkey: ${key}, value: ${JSON.stringify(value)}`);
		});

	};

	const showMyinfo = () => {
		AdminLogPrinter(adminConsole, `showMyinfo ${JSON.stringify(userInfo)}}`);
	};

	const showServerUser = () => {
		AdminLogPrinter(adminConsole, "\nshow server user list");
		socket.socket.emit("server-user-list");
	};

	const showServerRoom = () => {
		AdminLogPrinter(adminConsole, "\nshow server room list");
		socket.socket.emit("server-room-list");
	};

	const logOutHandler = () => {
		LogOut(adminConsole, setRefreshToken, navigate, "/");
		setHasLogin(false);
		setIsFirstLogin(true);
	};

	async function getMyinfoHandler() {
		const getMeResponse = await GetMyInfo(adminConsole, setUserInfo, setTfa, true);
		if (getMeResponse === 401) {
			const refreshResponse = await RefreshToken(adminConsole);
			if (refreshResponse !== 201) {
				logOutHandler();
			} else {
				const getMeResponse = await GetMyInfo(adminConsole, setUserInfo, setTfa, true);
				if (getMeResponse === 401) {
					logOutHandler();
				} else {
					socket.socket.connect();
					setIsFirstLogin(false);
				}
			}
		} else {
			socket.socket.connect();
			setIsFirstLogin(false);
		}
	}

	return (
		<BackGround>
			{
				adminConsole
					? <div>
						<button onClick={getMyinfoHandler}> /user/me</button>
						<button onClick={showMyinfo}> show /user/me</button>
						<button onClick={getRoomList}> roomList</button>
						<button onClick={getUserList}> userList</button>
						<button onClick={getDMList}> dmHistoryList</button>
						<button onClick={getFollowingList}> FollowList</button>
						<button onClick={getBlockList}> BlockList</button>
						<button onClick={showServerUser}> show server user</button>
						<button onClick={showServerRoom}> show server room</button>
						<button onClick={showSocketState}> socket state</button>
					</div>
					: ''
			}
			<TopBar />
			{userInfoModal ? <UserInfoModal /> : null}
			{roomModal ? <RoomModal /> : null}
			{inviteModal ? <RoomInviteModal /> : null}
			{pwInputModal ? <PasswordModal /> : null}
			{gameInviteModal ? <GameInviteModal /> : null}
			<ChatRoomList />
			<ChatUserList />
			<ChatArea />
			<ChatRoomUserList />
		</BackGround>
	);
}
