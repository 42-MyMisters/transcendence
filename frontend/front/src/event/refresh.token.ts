
export async function refereshToken() {
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
		console.log("referesh token error");
	}
}
