import { useMutation } from '@tanstack/react-query';
import { getToken, removeToken } from './../../utils/token/index';

const LogoutUser = async () => {
    try {
        const BASE_URL = import.meta.env.VITE_LOGOUT_USER_API;
        const res = await fetch(BASE_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
            credentials: "include"
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Logout User Failed");

        removeToken();
        return data.message;
    } catch (error) {
        console.error("Logout error:", error);
        throw error;
    }
};


export const usePostLogoutUserMutation = () => {
    return useMutation({
        mutationKey: ["logout"],
        mutationFn: LogoutUser
    });
}