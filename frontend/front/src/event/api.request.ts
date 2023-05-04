import type { UserType } from '../components/atom/UserAtom';

export function GetMyInfo({
	setUserInfo,
}: {
	setUserInfo: React.Dispatch<React.SetStateAction<UserType>>;
}): Number {

	let status = 0;

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
					throw new Error(`${response.status}`);
				}
				default: {
					throw new Error(`${response.status}`);
				}
			}
		})
		.then((response) => {
			response.nickname = response.nickname.split('#', 2)[0];
			setUserInfo({ ...response });
			status = 200;
		})
		.catch((error) => {
			console.log(`\nGetMyInfo: catch_error: ${error}`);
			status = error;
		});

	return status;
}

export function RefreshToken() {
	fetch("http://localhost:4000/login/oauth/refresh", {
		credentials: "include",
		method: "POST",
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + localStorage.getItem("refreshToken")
			// 'Authorization': 'Bearer ' + "test"
		}
	})
		// .then((response) => response.json())
		.then((response) => {
			console.log(`LL: ${response} ${JSON.stringify(response)}}}  ${response.status}`);
			switch (response.status) {
				case 200: {
					break;
				}
				case 401: {
					break;
				}
				case 400: {
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
