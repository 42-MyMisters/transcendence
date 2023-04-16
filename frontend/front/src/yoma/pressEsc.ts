
import { useEffect } from 'react';

export const PressEsc = (callback: () => void, keys: string[]) => {
	const onKeyDown = (event: KeyboardEvent) => {
		const wasAnyKeyPressed = keys.some((key: string) => event.key === key);
		if (wasAnyKeyPressed) {
			event.preventDefault();
			callback();
		}
	};
	useEffect(() => {
		document.addEventListener('keydown', onKeyDown);
		return () => {
			document.removeEventListener('keydown', onKeyDown);
		};
	}, [onKeyDown]);
};

//   pressEsc(() => {
//     setRoomModal(false);
//   }, ["Escape"]);
