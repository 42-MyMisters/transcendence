import { useEffect } from 'react';

export const PressKey = (keys: string[], callback: () => void) => {
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

export function AdminLogPrinter(adminConsole: boolean, ...args: any[]) {
	if (adminConsole) {
		console.log(...args);
	}
};
