export const saveToken = (token: string) => {
    const key = import.meta.env.VITE_ACCESS_TOKEN_KEY || 'access_token';
    localStorage.setItem(key, token);
}

export const getToken = (): string | null => {
    const key = import.meta.env.VITE_ACCESS_TOKEN_KEY || 'access_token';
    const token = localStorage.getItem(key);
    return token;
}

export const removeToken = () => {
    const key = import.meta.env.VITE_ACCESS_TOKEN_KEY || 'access_token';
    localStorage.removeItem(key);
}