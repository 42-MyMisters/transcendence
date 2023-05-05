import { NavigateFunction } from 'react-router-dom';
import type { UserType } from '../components/atom/UserAtom';
import * as socket from '../socket/chat.socket';

type setUserInfo = React.Dispatch<React.SetStateAction<UserType>>;

export async function GetMyInfo(setUserInfo: setUserInfo): Promise<number> {

	await fetch("http://localhost:4000/user/me", {
		credentials: "include",
		method: "GET",
	})
		.then((response) => {
			switch (response.status) {
				case 200: {
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
			if (error.message === "401") {
				console.log(`\nGetMyInfo: 401`);
			}
			console.log(`\nGetMyInfo: catch_error: ${error}`);
		});

	return 0;
}

export async function RefreshToken(
	callback: () => void,
): Promise<number> {

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
			console.log(`\nrefreshToken: ${response} ${JSON.stringify(response)}}}  ${response.status}`);
			switch (response.status) {
				case 201: {
					console.log(`\nrefreshToken : 201`);
					break;
				}
				default: {
					callback();
					break;
				}
			}
		}).catch((error) => {
			console.log(`\nRefreshToken catch_error: ${error} `);
		});

	return 0;
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
