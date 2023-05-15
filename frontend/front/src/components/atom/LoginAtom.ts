import { atom, useAtom } from "jotai";

export const refreshTokenAtom = atom(false);

export const cookieAtom = atom(false);

export const TFAEnabledAtom = atom(false);

export const TFAAuthenticatedAtom = atom(false);

export const isFirstLoginAtom = atom(true);
