import BackGround from "../components/BackGround";
import TopBar from "../components/TopBar";
import ChatRoomList from "../components/ChatPage/ChatRoomList";
import ChatUserList from "../components/ChatPage/ChatUserList";
import ChatArea from "../components/ChatPage/ChatArea";
import ChatRoomUserList from "../components/ChatPage/ChatRoomUserList";

import { useAtom } from "jotai";
import { userInfoModalAtom, passwordInputModalAtom, roomModalAtom, inviteModalAtom } from "../components/atom/ModalAtom";

import UserInfoModal from "../components/ChatPage/UserInfoModal";
import RoomModal from "../components/ChatPage/RoomModal";
import RoomInviteModal from "../components/ChatPage/RoomInviteModal";
import PasswordModal from "../components/ChatPage/PasswordModal";

import { UserAtom } from "../components/atom/UserAtom";
import type * as userType from "../components/atom/UserAtom";
import { useEffect, useState } from "react";

import * as socket from "../socket/chat.socket";
import * as chatAtom from "../components/atom/ChatAtom";
import type * as chatType from "../socket/chat.dto";
import { GetMyInfo, RefreshToken } from '../event/api.request';

export default function ChatPage() {
	const [userInfoModal, setUserInfoModal] = useAtom(userInfoModalAtom);
	const [roomModal, setRoomModal] = useAtom(roomModalAtom);
	const [inviteModal, setInviteModal] = useAtom(inviteModalAtom);
	const [pwInputModal, setPwInputModal] = useAtom(passwordInputModalAtom);

	const [userInfo, setUserInfo] = useAtom(UserAtom);
	const [isFirstLogin, setIsFirstLogin] = useAtom(chatAtom.isFirstLoginAtom);

	const [roomList, setRoomList] = useAtom(chatAtom.roomListAtom);
	const [userList, setUserList] = useAtom(chatAtom.userListAtom);
	const [userBlockList, setUserBlockList] = useAtom(chatAtom.userBlockListAtom);
	const [dmHistoryList, setDmHistoryList] = useAtom(chatAtom.dmHistoryListAtom);
	const [followingList, setFollowingList] = useAtom(chatAtom.followingListAtom);
	const [focusRoom, setFocusRoom] = useAtom(chatAtom.focusRoomAtom);
	const [socketState, setSocketState] = useAtom(chatAtom.socketStateAtom);


	const getRoomList = () => {
		console.log("\n\ngetRoomList");
		Object.entries(roomList).forEach(([key, value]) => {
			if (value.detail !== undefined) {
				console.log(`[ ${value.roomName} : ${key}] - ${value.roomType}`);
				Object.entries(value.detail).forEach(([key, value]) => {
					if (key === "userList") {
						Object.entries(value).forEach(([key, value]) => {
							console.log(`uid: ${key}, value: ${JSON.stringify(value)}`);
						});
					} else {
						console.log(`key: ${key}, value: ${JSON.stringify(value)}`);
					}
				});
			} else {
				console.log(`[ ${value.roomName} ] \nvalue: ${JSON.stringify(value)}`);
			}
		})
	};
	const getUserList = () => {
		console.log("\n\ngetUserList");
		Object.entries(userList).forEach(([key, value]) => {
			console.log(`[ ${value.userDisplayName} ]\nkey: ${key}, value: ${JSON.stringify(value)}`);
		})
	};
	const getFollowingList = () => {
		console.log(`getFollowingList ${JSON.stringify(followingList)}}`);
	};
	const showSocketState = () => {
		console.log(`socket state: ${socketState}`);
	};
	const emitTester = () => {
		socket.emitTest("hello")
	};
	const getMyinfo = () => {
		GetMyInfo(setUserInfo);
	}
	const showMyinfo = () => {
		console.log(`showMyinfo ${JSON.stringify(userInfo)}}`);
	}
	const showServerUser = () => {
		console.log('\nshow server user list');
		socket.socket.emit('server-user-list');
	}
	const showServerRoom = () => {
		console.log('\nshow server room list');
		socket.socket.emit('server-room-list');
	}

	const tryRefreshToken = () => {
		console.log('\nrefresh token');
		RefreshToken(GetMyInfo);
	}
	useEffect(() => {
		socket.socket.onAny((eventName, ...args) => {
			console.log("incoming ", eventName, args);
		});
		return () => {
			socket.socket.offAny();
		}
	}, []);

	useEffect(() => {
		// catch all outgoing events
		socket.socket.onAnyOutgoing((eventName, ...args) => {
			console.log("outgoing ", eventName, args);
		});
		return () => {
			socket.socket.offAnyOutgoing();
		}
	}, []);

	useEffect(() => {
		socket.socket.on("connect", () => {
			if (socket.socket.connected) {
				//This attribute describes whether the socket is currently connected to the server.
				if (socket.socket.recovered) {
					// any missed packets will be received
				} else {
					// new or unrecoverable session
					console.log("socket connected : " + socket.socket.id);
				}
			}
			setSocketState(true);
		});
	}, []);

	useEffect(() => {
		//https://socket.io/docs/v4/client-socket-instance/#disconnect
		socket.socket.on("disconnect", (reason) => {
			/**
			 *  BAD, will throw an error
			 *  socket.emit("disconnect");
			*/
			if (reason === "io server disconnect") {
				// the disconnection was initiated by the server, you need to reconnect manually
				console.log('socket disconnected by server');
				alert(`multiple login detected!`);
				// localStorage.removeItem('refreshToken');
			}
			// else the socket will automatically try to reconnect
			console.log("socket disconnected");
			setSocketState(false);
		});
	}, []);

	useEffect(() => {
		// the connection is denied by the server in a middleware function
		socket.socket.on("connect_error", (err) => {
			if (err.message === "unauthorized") {
				// handle each case
			}
			console.log(err.message); // prints the message associated with the error
		});
	}, []);

	useEffect(() => {
		socket.socket.on("room-list-notify", ({
			action,
			roomId,
			roomName,
			roomType,
		}: {
			action: 'add' | 'delete' | 'edit';
			roomId: number;
			roomName: string;
			roomType: 'open' | 'protected' | 'private';
		}) => {
			switch (action) {
				case 'add': {
					const newRoomList: chatType.roomListDto = {};
					newRoomList[roomId] = {
						roomName,
						roomType,
						isJoined: false,
					};
					console.log(`room-list-notify new: ${JSON.stringify(newRoomList)}`);
					console.log(`room-list-notify origin: ${JSON.stringify(roomList)}`);
					setRoomList({ ...roomList, ...newRoomList });
					break;
				}
				case 'delete': {
					const newRoomList: chatType.roomListDto = { ...roomList };
					delete newRoomList[roomId];
					setRoomList({ ...newRoomList });
					if (focusRoom == roomId) {
						setFocusRoom(-1);
					}
					break;
				}
				case 'edit': {
					const newRoomList: chatType.roomListDto = {};
					newRoomList[roomId] = {
						roomName,
						roomType,
						isJoined: roomList[roomId].isJoined || false,
						detail: roomList[roomId].detail || {} as chatType.roomDetailDto,
					};
					setRoomList({ ...roomList, ...newRoomList });
					break;
				}
			}
		});
		return () => {
			socket.socket.off("room-list-notify");
		};
	}, [roomList, focusRoom]);

	useEffect(() => {
		socket.socket.on("room-clear", () => {
			const cleanRoomList: chatType.roomListDto = {};
			setRoomList({ ...cleanRoomList });
			setFocusRoom(-1);
			socket.emitRoomList({ setRoomList });
		});
		return () => {
			socket.socket.off("room-clear");
		};
	}, []);

	useEffect(() => {
		socket.socket.on("user-clear", () => {
			const cleanUserList: chatType.userDto = {};
			setUserList({ ...cleanUserList });
			socket.emitUserList({ userList, setUserList });
		});
		return () => {
			socket.socket.off("room-clear");
		};
	}, []);

	useEffect(() => {
		socket.socket.on("room-join", ({
			roomId,
			roomName,
			roomType,
			userList = {},
			myPower,
			status
		}: {
			roomId: number,
			roomName: string,
			roomType: 'open' | 'protected' | 'private',
			userList: chatType.userInRoomListDto,
			myPower: 'owner' | 'admin' | 'member',
			status: 'ok' | 'ko'
		}) => {
			switch (status) {
				case 'ok': {
					console.log(`join [${roomName}] room`);
					const newRoomList: chatType.roomListDto = {};
					newRoomList[roomId] = {
						roomName,
						roomType,
						isJoined: true,
						detail: {
							userList: { ...userList },
							messageList: [],
							myRoomStatus: 'normal',
							myRoomPower: myPower
						}
					};
					console.log(`room-join new: ${JSON.stringify(newRoomList)}`);
					setRoomList({ ...roomList, ...newRoomList });
					setFocusRoom(roomId);
					// socket.emitMessage({ roomList }, roomId, "joins this room"); //XXX: this will cause a bug
					break;
				}
				case 'ko': {
					if (roomList[roomId].isJoined === false) {
						alert(`fail to join [${roomName}] room`);
					}
					break;
				}
			}
		});
		return () => {
			socket.socket.off("room-join");
		};
	}, [roomList]);

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
			if (roomList[roomId].isJoined === false) {
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
					if (targetId !== userInfo.uid) {
						const newUserList: chatType.userInRoomListDto = roomList[roomId].detail?.userList!;
						delete newUserList[targetId];
						socket.setNewDetailToNewRoom({ roomList, setRoomList, roomId, newUserList });
					}
					break;
				}
				case 'mute':
				case 'normal': {
					if (targetId === userInfo.uid) {
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
	}, [roomList, userInfo]);

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
			console.log(`user-upadate: user ${userId} is ${userStatus}`);
			setUserList({ ...userList, ...newUser });
		});
		return () => {
			socket.socket.off("user-update");
		}
	}, [userList, userInfo]);

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
			const block = userBlockList[from] ? true : false;
			switch (block) {
				case true: {
					console.log(`message from ${from} is blocked`);
					break;
				}
				case false: {
					console.log(`message from ${from} is received: ${message}`);
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
					setRoomList({ ...roomList, ...newRoomList });
					break;
				}
			}
		});
		return () => {
			socket.socket.off("message");
		};
	}, [roomList, userBlockList, userList, userInfo]);

	if (isFirstLogin) {
		console.log('set init data');
		GetMyInfo(setUserInfo);
		socket.emitUserBlockList({ userBlockList, setUserBlockList });
		socket.emitFollowingList({ userList, setUserList, followingList, setFollowingList });
		socket.emitDmHistoryList({ userList, setUserList, dmHistoryList, setDmHistoryList });
		socket.emitUserList({ userList, setUserList });
		socket.emitRoomList({ setRoomList });
		if (userInfo.uid === 1) {
			GetMyInfo(setUserInfo);
		}
		setIsFirstLogin(false);
	}

	return (
		<BackGround>
			<button onClick={getMyinfo}> /user/me</button>
			<button onClick={showMyinfo}> show /user/me</button>
			<button onClick={getRoomList}> roomList</button>
			<button onClick={getUserList}> userList</button>
			<button onClick={getFollowingList}> FollowList</button>
			<button onClick={emitTester}> emitTest</button>
			<button onClick={showServerUser}> show server user</button>
			<button onClick={showServerRoom}> show server room</button>
			<button onClick={showSocketState}> socket state</button>
			<button onClick={tryRefreshToken}> RefreshToken</button>
			<TopBar />
			{userInfoModal ? <UserInfoModal /> : null}
			{roomModal ? <RoomModal /> : null}
			{inviteModal ? <RoomInviteModal /> : null}
			{pwInputModal ? <PasswordModal /> : null}
			<ChatRoomList />
			<ChatUserList />
			<ChatArea />
			<ChatRoomUserList />
		</BackGround >
	);
}
