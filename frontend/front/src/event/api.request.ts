import { NavigateFunction } from 'react-router-dom';
import type { UserType } from '../components/atom/UserAtom';
import * as socket from '../socket/chat.socket';

type setUserInfo = React.Dispatch<React.SetStateAction<UserType>>;

export function GetMyInfo(setUserInfo: setUserInfo) {

	fetch("http://localhost:4000/user/me", {
		credentials: "include",
		method: "GET",
	})
		.then((response) => {
			switch (response.status) {
				case 200: {
					return response.json();
				}
				case 401: {
					throw new Error(`401 - ${response.status}`);
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
			console.log(`\nGetMyInfo: catch_error: ${error}`);
		});

	return {};
}

export function RefreshToken(callback: (setUserInfo: setUserInfo) => {}) {
	fetch("http://localhost:4000/login/oauth/refresh", {
		credentials: "include",
		method: "POST",
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + localStorage.getItem("refreshToken")
		}
	})
		.then((response) => {
			console.log(`LL: ${response} ${JSON.stringify(response)}}}  ${response.status}`);
			switch (response.status) {
				case 201: {
					break;
				}
				case 400: {
					break;
				}
				case 401: { // invalid refresh token
					break;
				}
				default: {
					break;
				}
			}
		}).catch((error) => {
			console.log(`\nRefreshToken catch_error: ${error} `);
		});

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
