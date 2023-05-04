import type { UserType } from '../components/atom/UserAtom';

export function GetMyInfo({
	setUserInfo,
}: {
	setUserInfo: React.Dispatch<React.SetStateAction<UserType>>;
}) {
	fetch("http://localhost:4000/user/me", {
		credentials: "include",
		method: "GET",
	})
		.then((response) => response.json())
		.then((response) => {
			switch (response.status) {
				case 200: {
					response.nickname = response.nickname.split('#', 2)[0];
					setUserInfo({ ...response });
					break;
				}
				default: {
					console.log(`error: ${response.status}: ${response.message}\n need to refresh token`);
					break;
				}
			}
		})
		.catch((error) => {
			console.log(`catch_error: ${error}`);
		});

	return undefined;
}

export function RefreshToken() {
	fetch("http://localhost:4000/login/oauth/refresh", {
		credentials: "include",
		method: "POST",
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + localStorage.getItem("refreshToken")
		}
	})
		.then((response) => response.json())
		.then((response) => {
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
			console.log(`catch_error: ${error}`);
		});
}
