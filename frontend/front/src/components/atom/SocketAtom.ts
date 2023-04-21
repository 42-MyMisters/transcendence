import { atom, createStore } from "jotai";


export const socketFirstTouch = atom<boolean>(false);
export const hasLogin = atom<boolean>(false);
// export const storeSocketInit = createStore();

// storeSocketInit.set(socketFirstTouch, false);

// export const readWriteAtom = atom(
// 	(get) => {
// 		get(socketFirstTouch)
// 	},
// 	(get, set, newState: boolean) => {
// 		set(socketFirstTouch, newState)
// 	}
// )
