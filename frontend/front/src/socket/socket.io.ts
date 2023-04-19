import { io } from 'socket.io-client';

const URL = process.env.BE_SOCKET_URL || "http://localhost:4000/sock";

export const socket = io(URL, {
	auth: (cb) => {
		cb({ token: localStorage.getItem("refreshToken") });
	},
	reconnectionDelay: 5000,
});

export const onSocketEvent = () => {
	socket.onAny((event, ...args) => {
		console.log(event, args);
	});

	socket.on("connect", () => {
		console.log("socket connected");

	});

	socket.on("disconnect", (reason) => {
		console.log("socket disconnected");
	});

	// socket.on("connect_error", () => {
	// 	setTimeout(() => {
	// 	socket.connect();
	// 	}, 1000);
	// });

};



