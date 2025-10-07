import Cookies from "js-cookie";

// export const saveToken = (token: string) => {
//     const key = import.meta.env.VITE_ACCESS_TOKEN || "accessToken";
//     Cookies.set(key, token, {
//         expires: 1,
//         secure: true,
//         sameSite: "strict",
//     });
// };

export const getToken = (): string | undefined => {
    const key = import.meta.env.VITE_ACCESS_TOKEN_KEY;
    return Cookies.get(key);
};

export const removeToken = () => {
    const key = import.meta.env.VITE_ACCESS_TOKEN_KEY;
    Cookies.remove(key);
};
