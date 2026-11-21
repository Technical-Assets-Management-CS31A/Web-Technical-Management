import Cookies from "js-cookie";

// Both tokens come back in the /auth/login body: the backend sets no cookies, so the client keeps them.

const cookieOptions = () => ({ sameSite: "strict" as const, secure: window.location.protocol === "https:" });

export const getToken = (): string | undefined => {
    const key = import.meta.env.VITE_ACCESS_TOKEN_KEY;
    return Cookies.get(key);
};
export const setToken = (token: string) => {
    const key = import.meta.env.VITE_ACCESS_TOKEN_KEY;
    Cookies.set(key, token, cookieOptions());
};

export const getRefreshToken = (): string | undefined => {
    const key = import.meta.env.VITE_REFRESH_TOKEN_KEY;
    return Cookies.get(key);
};
export const setRefreshToken = (token: string) => {
    const key = import.meta.env.VITE_REFRESH_TOKEN_KEY;
    Cookies.set(key, token, cookieOptions());
};

// Ends the local session: both tokens go.
export const removeToken = () => {
    Cookies.remove(import.meta.env.VITE_REFRESH_TOKEN_KEY);
    return Cookies.remove(import.meta.env.VITE_ACCESS_TOKEN_KEY);
};
