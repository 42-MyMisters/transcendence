import { atom } from "jotai";

const socketFirstTouch = atom(false);

export const socketInitAtom = atom(
	(get) => get(socketFirstTouch),
	(get, set, firstTouch: boolean) => {
		set(socketFirstTouch, firstTouch)
	});

