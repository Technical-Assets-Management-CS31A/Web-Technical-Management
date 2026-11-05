import Cookies from "js-cookie";

// The access token lives in a readable cookie; the refresh token is an HttpOnly cookie set by the backend.

export const getToken = (): string | undefined => {
    const key = import.meta.env.VITE_ACCESS_TOKEN_KEY;
    return Cookies.get(key);
};
export const setToken = (token: string) => {
    const key = import.meta.env.VITE_ACCESS_TOKEN_KEY;
    Cookies.set(key, token, { sameSite: "strict", secure: window.location.protocol === "https:" });
};
export const removeToken = () => {
    const key = import.meta.env.VITE_ACCESS_TOKEN_KEY;
    return Cookies.remove(key);
};
