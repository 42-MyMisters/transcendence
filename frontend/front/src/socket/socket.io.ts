import { io } from 'socket.io-client';
import { useAtom } from "jotai";
import { socketAtom } from '../components/atom/SocketAtom';

const URL = process.env.BE_SOCKET_URL || "http://localhost:4000/sock";

export const socket = io(URL, {
	auth: (cb) => {
		cb({ token: localStorage.getItem("refreshToken") });
	},
	reconnectionDelay: 5000,
});

/**
 * 0 이벤트 리스너
 */
export const OnSocketEvent = () => {
	const [socketState, setSocketState] = useAtom(socketAtom);

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

	/**
	 * 1. 최초 연결시, 방 목록, dm 목록, 유저 목록(팔로워)을 받아온다.
	 * 채팅 화면은 아무것도 연결 안되어 있는 상태. 방 클릭하면 그 방으로 접속 시도
	 */

	/**
	 * 2. 방 클릭시, 방에 접속한다.
	 * protected 방이면 비민 번호를 입력후, 맞으면 접속
	 * 채팅 화면이 접속한 방 정보로 변경.
	 */

	/**
	 * 3. 유저 클릭시, 유저랑 DM.
	 * NOTE: 상대가 나를, 내가 상대를 block 되어 있으면?
	 */

	/**
	 * 4. 방에서 유저 클릭시 userInfoModal을 띄우고 각 기능 수행
	 */

	/**
	 * 5. 채팅 엔터, 버튼 클릭시 현재 접속한 방에 메시지 전송
	 * 아무런 방에 접속하지 않은채 메시지 전송시, 아무것도 안되게
	 */

};

