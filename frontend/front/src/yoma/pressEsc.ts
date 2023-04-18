
import { useEffect } from 'react';

<<<<<<< HEAD
export const PressEsc = (keys: string[], callback: () => void) => {
=======
export const PressEsc = (callback: () => void, keys: string[]) => {
>>>>>>> c3e81c85d0c39db2c07a2c4a8c3e61faee5aee87
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
	}, []);
};

<<<<<<< HEAD
=======
//   pressEsc(() => {
//     setRoomModal(false);
//   }, ["Escape"]);
>>>>>>> c3e81c85d0c39db2c07a2c4a8c3e61faee5aee87
