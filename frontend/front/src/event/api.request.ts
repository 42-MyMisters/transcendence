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
			console.log(response);
			response.nickname = response.nickname.split('#', 2)[0];
			setUserInfo({ ...response });
		})
		.catch((error) => {
			console.log(`error: ${error}`);
		});

	return undefined;
}

export async function RefreshToken() {
	try {
		const response = await fetch("http://localhost:4000/login/oauth/refresh", {
			credentials: "include",
			method: "GET",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + localStorage.getItem("refreshToken")
			}
		});
		const json = await response.json();
	} catch (e) {
		console.log("RefreshToken Request Error -> expired refreshToken -> remove refreshToken");
		localStorage.removeItem("refreshToken");
	}
}
