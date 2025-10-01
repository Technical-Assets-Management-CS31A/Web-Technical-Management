
export const saveToken = (token: string) => {
    const key = import.meta.env.VITE_ACCESS_TOKEN_KEY || 'accessToken';
    localStorage.setItem(key, token);
}

export const getToken = (): string | null => {
    const key = import.meta.env.VITE_ACCESS_TOKEN_KEY || 'accessToken';
    const token = localStorage.getItem(key);
    return token;
}

export const removeToken = () => {
    const key = import.meta.env.VITE_ACCESS_TOKEN_KEY || 'accessToken';
    localStorage.removeItem(key);
}