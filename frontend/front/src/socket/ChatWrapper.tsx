
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
	gameInviteModalAtom,
	inviteModalAtom,
	passwordInputModalAtom,
	userInfoModalAtom
} from "../components/atom/ModalAtom";

import {
	isGameStartedAtom,
	isLoadingAtom,
} from "../components/atom/GameAtom";

import { useEffect } from "react";
import { refreshTokenAtom } from "../components/atom/LoginAtom";
import { TFAAtom, UserAtom } from "../components/atom/UserAtom";

import { useNavigate } from "react-router-dom";
import * as chatAtom from "../components/atom/ChatAtom";
import { GetMyInfo, LogOut, RefreshToken } from "../event/api.request";
import type * as chatType from "./chat.dto";
import * as socket from "./chat.socket";

import { AdminLogPrinter, PressKey } from "../event/event.util";

export default function ChatWrapper({ children }: { children: JSX.Element }) {
	const setUserInfoModal = useSetAtom(userInfoModalAtom);
	const setInviteModal = useSetAtom(inviteModalAtom);

	const [userInfo, setUserInfo] = useAtom(UserAtom);
	const [isFirstLogin, setIsFirstLogin] = useAtom(chatAtom.isFirstLoginAtom);
	const setHasLogin = useSetAtom(chatAtom.hasLoginAtom);

	const [roomList, setRoomList] = useAtom(chatAtom.roomListAtom);
	const [userList, setUserList] = useAtom(chatAtom.userListAtom);
	const [dmHistoryList, setDmHistoryList] = useAtom(chatAtom.dmHistoryListAtom);
	const [followingList, setFollowingList] = useAtom(chatAtom.followingListAtom);
	const [blockList, setBlockList] = useAtom(chatAtom.blockListAtom);
	const [focusRoom, setFocusRoom] = useAtom(chatAtom.focusRoomAtom);
	const setSocketState = useSetAtom(chatAtom.socketStateAtom);

	const navigate = useNavigate();
	const setRefreshToken = useSetAtom(refreshTokenAtom);

	const setGameInviteModal = useSetAtom(gameInviteModalAtom);
	const [adminConsole, setAdminConsole] = useAtom(chatAtom.adminConsoleAtom);
	const [passwordModal, setPasswordModal] = useAtom(passwordInputModalAtom);
	const [clickRoom] = useAtom(chatAtom.clickRoomAtom);
	const setTfa = useSetAtom(TFAAtom);


	const isLoading = useAtomValue(isLoadingAtom);
	const isGameStart = useAtomValue(isGameStartedAtom);

	PressKey(["F4"], () => {
		setAdminConsole((prev) => !prev);
	});

	const logOutHandler = () => {
		LogOut(adminConsole, setRefreshToken, navigate, "/");
		setHasLogin(false);
		setIsFirstLogin(true);
	};

	const quitRoomRelativeModal = () => {
		setUserInfoModal(false);
		setInviteModal(false);
		// setRoomModal(false);
	}	// setPwInputModal(false);


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

	useEffect(() => {
		socket.socket.onAny((eventName, ...args) => {
			AdminLogPrinter(adminConsole, "incoming ", eventName, args);
		});
		// catch all outgoing events
		socket.socket.onAnyOutgoing((eventName, ...args) => {
			AdminLogPrinter(adminConsole, "outgoing ", eventName, args);
		});
		socket.socket.on("connect", () => {
			if (socket.socket.connected) {
				//This attribute describes whether the socket is currently connected to the server.
				if (socket.socket.recovered) {
					// any missed packets will be received
				} else {
					// new or unrecoverable session
					AdminLogPrinter(adminConsole, "socket connected : " + socket.socket.id);
				}
			}
			setSocketState(true);
		});
		//https://socket.io/docs/v4/client-socket-instance/#disconnect
		socket.socket.on("disconnect", (reason) => {
			AdminLogPrinter(adminConsole, "socket disconnected reason: " + reason);
			/**
			 *  BAD, will throw an error
			 *  socket.emit("disconnect");
			*/
			if (reason === "io server disconnect") {
				// the disconnection was initiated by the server, you need to reconnect manually
				AdminLogPrinter(adminConsole, 'socket disconnected by server');
				socket.socket.removeAllListeners();
			}
			// else the socket will automatically try to reconnect
			AdminLogPrinter(adminConsole, "socket disconnected");
			setSocketState(false);
		});
		// the connection is denied by the server in a middleware function
		socket.socket.on("connect_error", (err) => {
			if (err.message === "unauthorized") {
				// handle each case
			}
			AdminLogPrinter(adminConsole, err.message); // prints the message associated with the error
		});
		socket.socket.on("multiple-login", () => {
			// 	alert(`multiple login detected!`);
			LogOut(adminConsole, setRefreshToken, navigate, "/", 'refresh', "multiple-login");
			setHasLogin(false);
			setIsFirstLogin(true);
		});
		return () => {
			socket.socket.off("connect");
			socket.socket.off("disconnect");
			socket.socket.off("connect_error");
			socket.socket.offAny();
			socket.socket.offAnyOutgoing();
			socket.socket.off("multiple-login");
		}
	}, []);

	useEffect(() => {
		socket.socket.on("logout", () => {
			LogOut(adminConsole, setRefreshToken, navigate, "/");
			setHasLogin(false);
			setIsFirstLogin(true);
		});
		return () => {
			socket.socket.off("logout");
		};
	}, []);

	useEffect(() => {
		socket.socket.on("dm-list", (resDmUserList, mergeDmList) => {
			const tempDmRoomList: chatType.roomListDto = {};

			setDmHistoryList({ ...resDmUserList });
			setUserList((prevUserList) => ({ ...prevUserList, ...resDmUserList }));
			Object.entries(resDmUserList).forEach(([dmUser]) => {
				tempDmRoomList[Number(dmUser)] = {
					roomName: 'DM',
					roomType: 'dm',
					isJoined: true,
					detail: {
						userList: {
							[Number(dmUser)]: {
								userRoomPower: 'member',
								userRoomStatus: 'normal',
							},
							[userInfo.uid]: {
								userRoomPower: 'member',
								userRoomStatus: 'normal',
							}
						},
						messageList: [],
						myRoomStatus: 'normal',
						myRoomPower: 'member'
					}
				};
			});

			Object.entries(mergeDmList).forEach((atom: any[]) => {
				if (Number(atom[1].senderId!) === userInfo.uid) { // from me
					const tempMessageList: chatType.roomMessageDto[] = tempDmRoomList[Number(atom[1]?.receiverId!)].detail?.messageList!;
					tempMessageList?.unshift({
						userId: userInfo.uid,
						userName: userInfo.nickname,
						message: atom[1]?.message!,
						isMe: true,
						number: tempMessageList.length
					});
					tempDmRoomList[Number(atom[1]?.receiverId!)] = {
						roomName: 'DM',
						roomType: 'dm',
						isJoined: true,
						detail: {
							userList: { ...tempDmRoomList[Number(atom[1]?.receiverId!)].detail?.userList },
							myRoomPower: 'member',
							myRoomStatus: 'normal',
							messageList: tempMessageList
						}
					}
				} else { // to me
					if (atom[1].blockFromReceiver) {
						return;
					}
					const tempMessageList: chatType.roomMessageDto[] = tempDmRoomList[Number(atom[1]?.senderId!)]?.detail?.messageList!;
					tempMessageList?.unshift({
						userId: Number(atom[1]?.senderId!),
						userName: resDmUserList[Number(atom[1]?.senderId!)]?.userDisplayName,
						message: atom[1]?.message!,
						isMe: false,
						number: tempMessageList.length
					});
					tempDmRoomList[Number(atom[1]?.senderId!)] = {
						roomName: 'DM',
						roomType: 'dm',
						isJoined: true,
						detail: {
							userList: { ...tempDmRoomList[Number(atom[1]?.senderId!)]?.detail?.userList },
							myRoomPower: 'member',
							myRoomStatus: 'normal',
							messageList: tempMessageList
						}
					}
				}
			});
			setRoomList((prevRoomList) => ({ ...prevRoomList, ...tempDmRoomList }));

		});
		return () => {
			socket.socket.off("dm-list");
		};
	}, [userInfo, roomList, dmHistoryList, userList]);


	useEffect(() => {
		socket.socket.on("room-list", (resRoomList: chatType.roomListDto) => {
			setRoomList((prevRoomList) => ({ ...prevRoomList, ...resRoomList }));
		});
		socket.socket.on("follow-list", (resFollowingList: chatType.userDto) => {
			setFollowingList({ ...resFollowingList });
			setUserList((prevUserList) => ({ ...resFollowingList, ...prevUserList }));
		});
		socket.socket.on("block-list", (resBlockList: chatType.userSimpleDto) => {
			setBlockList({ ...resBlockList });
		});
		socket.socket.on("user-list", (resUserList: chatType.userDto) => {
			setUserList((prevUserList) => ({ ...prevUserList, ...resUserList }))
		});
		return () => {
			socket.socket.off("room-list");
			socket.socket.off("follow-list");
			socket.socket.off("block-list");
			socket.socket.off("user-list");
		}
	}, [userList, roomList, followingList, blockList]);

	useEffect(() => {
		socket.socket.on("room-list-update", ({
			action,
			roomId,
			roomName,
			roomType,
		}: {
			action: 'new' | 'delete' | 'edit';
			roomId: number;
			roomName: string;
			roomType: 'open' | 'protected' | 'private';
		}) => {
			switch (action) {
				case 'new': {
					const newRoomList: chatType.roomListDto = {};
					newRoomList[roomId] = {
						roomName,
						roomType,
						isJoined: false,
					};
					AdminLogPrinter(adminConsole, `room-list-update new: ${JSON.stringify(newRoomList)}`);
					AdminLogPrinter(adminConsole, `room-list-update origin: ${JSON.stringify(roomList)}`);
					setRoomList({ ...roomList, ...newRoomList });
					break;
				}
				case 'delete': {
					const newRoomList: chatType.roomListDto = { ...roomList };
					delete newRoomList[roomId];
					setRoomList({ ...newRoomList });
					if (focusRoom === roomId) {
						setFocusRoom(-1);
					}
					if (passwordModal && roomId === clickRoom) {
						setPasswordModal(false);
					}
					break;
				}
				case 'edit': {
					const newRoomList: chatType.roomListDto = {};
					newRoomList[roomId] = {
						roomName,
						roomType,
						isJoined: roomList[roomId]?.isJoined,
						detail: roomList[roomId].detail || {} as chatType.roomDetailDto,
					};
					setRoomList({ ...roomList, ...newRoomList });
					if (passwordModal && roomId === clickRoom) {
						setPasswordModal(false);
					}
					break;
				}
			}
		});
		return () => {
			socket.socket.off("room-list-update");
		};
	}, [roomList, focusRoom, passwordModal, clickRoom]);

	useEffect(() => {
		socket.socket.on("room-clear", () => {
			quitRoomRelativeModal();
			setRoomList({});
			setFocusRoom(-1);
		});
		socket.socket.on("user-clear", () => {
			setUserList({});
		});
		return () => {
			socket.socket.off("room-clear");
			socket.socket.off("user-clear");
		};
	}, [roomList, userList, setRoomList, setUserList]);

	useEffect(() => {
		socket.socket.on("room-join", ({
			roomId,
			roomName,
			roomType,
			roomUserList = {},
			myPower,
			status,
			method = ''
		}: {
			roomId: number,
			roomName: string,
			roomType: 'open' | 'protected' | 'private' | 'dm',
			roomUserList: chatType.userInRoomListDto,
			myPower: chatType.userRoomPower,
			status: 'ok' | 'ko',
			method?: 'invite' | ''
		}) => {
			switch (status) {
				case 'ok': {
					AdminLogPrinter(adminConsole, `join [${roomName}]room`);
					const newRoomList: chatType.roomListDto = {};
					newRoomList[roomId] = {
						roomName,
						roomType,
						isJoined: true,
						detail: {
							userList: { ...roomUserList },
							messageList: [],
							myRoomStatus: 'normal',
							myRoomPower: myPower
						}
					};
					AdminLogPrinter(adminConsole, `room - join new: ${JSON.stringify(newRoomList)}`);
					setRoomList({ ...roomList, ...newRoomList });
					if (method !== 'invite') {
						setFocusRoom(roomId);
					}
					if (roomType === 'dm') {
						const newDmUser: chatType.userDto = {};
						newDmUser[roomId] = {
							userDisplayName: userList[roomId].userDisplayName,
							userProfileUrl: userList[roomId].userProfileUrl,
							userStatus: userList[roomId].userStatus,
							dmStatus: method === 'invite' ? 'unread' : 'read',
						};
						setDmHistoryList((prevDmHistoryList) => ({ ...prevDmHistoryList, ...newDmUser }));
						setUserList((prevUserList) => ({ ...prevUserList, ...newDmUser }));
					}
					break;
				}
				case 'ko': {
					if (roomList[roomId].isJoined === false) {
						alert(`fail to join[${roomName}]room`);
					}
					break;
				}
			}
		});
		return () => {
			socket.socket.off("room-join");
		};
	}, [roomList, userList, dmHistoryList]);


	useEffect(() => {
		socket.socket.on("room-in-action", ({
			roomId,
			action,
			targetId
		}: {
			roomId: number;
			action: 'ban' | 'kick' | 'mute' | 'admin' | 'normal' | 'owner' | 'leave' | 'newMember';
			targetId: number
		}) => {
			if (roomList[roomId]?.isJoined !== true) {
				return;
			}
			switch (action) {
				case 'newMember': {
					if (targetId === userInfo.uid) {
						return;
					} else {
						const newUser: chatType.userInRoomListDto = {};
						newUser[targetId] = {
							userRoomStatus: 'normal',
							userRoomPower: 'member'
						};
						const newUserList: chatType.userInRoomListDto = { ...roomList[roomId].detail?.userList!, ...newUser };
						socket.setNewDetailToNewRoom({ roomList, setRoomList, roomId, newUserList })
					}
					break;
				}
				case 'ban':
				case 'leave':
				case 'kick': {
					if (targetId === userInfo.uid) {
						if (roomList[roomId].roomType === 'private') {
							const newRoomList: chatType.roomListDto = { ...roomList };
							delete newRoomList[roomId];
							setRoomList({ ...newRoomList });
						} else {
							const newRoomList: chatType.roomListDto = {};
							newRoomList[roomId] = {
								roomName: roomList[roomId].roomName,
								roomType: roomList[roomId].roomType,
								isJoined: false,
							}
							setRoomList({ ...roomList, ...newRoomList });
						}
						if (focusRoom === roomId) {
							setFocusRoom(-1);
							quitRoomRelativeModal();
						}
					} else {
						const newUserList: chatType.userInRoomListDto = roomList[roomId].detail?.userList!;
						delete newUserList[targetId];
						socket.setNewDetailToNewRoom({ roomList, setRoomList, roomId, newUserList });
					}
					break;
				}
				case 'mute':
				case 'normal': {
					if (targetId === userInfo.uid) {
						if (action === 'mute' && roomList[roomId].detail?.myRoomStatus === 'mute') {
							return;
						}
						const newUserList: chatType.userInRoomListDto = roomList[roomId].detail?.userList!;
						newUserList[targetId] = { ...newUserList[targetId], userRoomStatus: action };
						socket.setNewDetailToNewRoom({ roomList, setRoomList, roomId, newUserList }, action);
					} else {
						const newUserList: chatType.userInRoomListDto = roomList[roomId].detail?.userList!;
						newUserList[targetId] = { ...newUserList[targetId], userRoomStatus: action };
						socket.setNewDetailToNewRoom({ roomList, setRoomList, roomId, newUserList });
					}
					break;
				}
				case 'owner':
				case 'admin': {
					if (targetId === userInfo.uid) {
						const newUserList: chatType.userInRoomListDto = roomList[roomId].detail?.userList!;
						newUserList[targetId] = { ...newUserList[targetId], userRoomPower: action };
						socket.setNewDetailToNewRoom({ roomList, setRoomList, roomId, newUserList }, undefined, action);
					} else {
						const newUserList: chatType.userInRoomListDto = roomList[roomId].detail?.userList!;
						newUserList[targetId] = { ...newUserList[targetId], userRoomPower: action };
						socket.setNewDetailToNewRoom({ roomList, setRoomList, roomId, newUserList });
					}
					break;
				}
			}
		});
		return () => {
			socket.socket.off("room-in-action");
		}
	}, [roomList, userInfo, focusRoom]);

	useEffect(() => {
		socket.socket.on("user-update", ({
			userId,
			userDisplayName,
			userProfileUrl,
			userStatus
		}: {
			userId: number,
			userDisplayName: string
			userProfileUrl: string;
			userStatus: 'online' | 'offline' | 'inGame';
		}) => {
			const newUser: chatType.userDto = {};
			newUser[userId] = {
				userDisplayName,
				userProfileUrl,
				userStatus,
			};
			AdminLogPrinter(adminConsole, `user-update: ${userDisplayName}: ${userStatus}`);
			setUserList((prevUserList) => ({ ...prevUserList, ...newUser }));
		});
		return () => {
			socket.socket.off("user-update");
		}
	}, [userList, isFirstLogin]);

	useEffect(() => {
		socket.socket.on("message", ({
			roomId,
			from,
			message
		}: {
			roomId: number,
			from: number,
			message: string
		}) => {
			const block = blockList[from] ? true : false;
			switch (block) {
				case true: {
					AdminLogPrinter(adminConsole, `message from ${from} is blocked`);
					break;
				}
				case false: {
					AdminLogPrinter(adminConsole, `message from ${from} is received: ${message}`);
					const newMessageList: chatType.roomMessageDto[] = roomList[roomId].detail?.messageList!;
					newMessageList.unshift({
						userId: from,
						userName: userList[from].userDisplayName,
						message,
						isMe: userInfo.uid === from ? true : false,
						number: roomList[roomId].detail?.messageList.length!
					});
					const newDetail: Partial<chatType.roomDetailDto> = { ...roomList[roomId].detail, messageList: [...newMessageList] };
					const newRoomList: chatType.roomListDto = {};
					newRoomList[roomId] = {
						roomName: roomList[roomId].roomName,
						roomType: roomList[roomId].roomType,
						isJoined: roomList[roomId].isJoined,
						detail: newDetail as chatType.roomDetailDto
					};
					if (roomList[roomId].roomType === 'dm' && focusRoom !== roomId) {
						const newDmUser: chatType.userDto = {};
						newDmUser[roomId] = {
							userDisplayName: userList[roomId].userDisplayName,
							userProfileUrl: userList[roomId].userProfileUrl,
							userStatus: userList[roomId].userStatus,
							dmStatus: 'unread',
						};
						setUserList({ ...userList, ...newDmUser });
					}
					setRoomList({ ...roomList, ...newRoomList });
					break;
				}
			}
		});
		return () => {
			socket.socket.off("message");
		};
	}, [roomList, blockList, userList, userInfo, focusRoom]);

	async function firstLogin() {
		if (isFirstLogin) {
			await getMyinfoHandler();
		}
	}

	useEffect(() => {
		console.log(`isLoading: ${isLoading}`);
		if (isLoading) {
			socket.emitUserUpdate(adminConsole, 'inGame');
		}
	}, [isLoading]);

	useEffect(() => {
		if (userList[userInfo.uid]?.userStatus === 'inGame' && !isGameStart) {
			socket.emitUserUpdate(adminConsole, 'online');
		}
	}, [isGameStart]);

	useEffect(() => {
		if (isFirstLogin) {
			firstLogin();
		}
	}, []);


	return (
		<>
			{children}
		</>
	);
}
