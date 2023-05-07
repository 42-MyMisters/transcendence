import { NavigateFunction } from 'react-router-dom';
import type { UserType } from '../components/atom/UserAtom';
import type * as chatType from '../socket/chat.dto';
import * as socket from '../socket/chat.socket';

type setUserInfo = React.Dispatch<React.SetStateAction<UserType>>;

export async function DoFollow(
	userUid: number,
	doOrUndo: boolean,
	followingList: chatType.userDto,
	setFollowingList: React.Dispatch<React.SetStateAction<chatType.userDto>>,
	userList: chatType.userDto,
): Promise<number> {

	let status = -1;
	const resource = doOrUndo ? "follow" : "unfollow";

	await fetch('http://localhost:4000/user/' + resource + `/${userUid}`, {
		credentials: "include",
		method: "POST",
	})
		.then((response) => {
			status = response.status;
			switch (response.status) {
				case 201: {
					if (doOrUndo) {
						const tempFollowing: chatType.userDto = {};
						tempFollowing[userUid] = {
							...userList[userUid],
						};
						setFollowingList({ ...followingList, ...tempFollowing });
					} else {
						const tempFollowing = { ...followingList };
						delete tempFollowing[userUid];
						setFollowingList({ ...tempFollowing });
					}
					break;
				}
				default: {
					throw new Error(`${response.status}`);
				}
			}
		})
		.catch((error) => {
			console.log(`\nDoFollow catch_error: ${error} `);
		});

	return status;
}

export async function GetMyInfo(setUserInfo: setUserInfo): Promise<number> {

	let status = -1;

	await fetch("http://localhost:4000/user/me", {
		credentials: "include",
		method: "GET",
	})
		.then((response) => {
			switch (response.status) {
				case 200: {
					status = 200;
					return response.json();
				}
				default: {
					throw new Error(`${response.status}`);
				}
			}
		})
		.then((response) => {
			console.log(`\nGetMyInfo: ${JSON.stringify(response)}`);
			response.nickname = response.nickname.split('#', 2)[0];
			setUserInfo({ ...response });
		})
		.catch((error) => {
			status = error.message;
			console.log(`\nGetMyInfo catch_error: ${error} `);
		});

	return status;
}

export async function RefreshToken(
	callback = (): any => { }
): Promise<number> {
	let status = -1;

	console.log(`in try refresh Token`);
	await fetch("http://localhost:4000/login/oauth/refresh", {
		credentials: "include",
		method: "POST",
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + localStorage.getItem("refreshToken")
		}
	})
		.then((response) => {
			status = response.status;
			switch (response.status) {
				case 201: {
					callback();
					break;
				}
				default: {
					throw new Error(`${response.status}`);
				}
			}
		}).catch((error) => {
			console.log(`\nRefreshToken catch_error: ${error} `);
		});

	return status;
}

export function LogOut(
	setRefreshToken: React.Dispatch<React.SetStateAction<boolean>>,
	navigate: NavigateFunction,
	to: string
) {
	console.log("logout");
	socket.socket.emit("chat-logout");
	socket.socket.disconnect();
	localStorage.clear();
	setRefreshToken(false);
	navigate(to);
}
