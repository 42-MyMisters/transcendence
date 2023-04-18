
import { useEffect } from 'react';

export const PressKeyboard = (keys: string[], callback: () => void) => {
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

